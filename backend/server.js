const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const app = express();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // We will add your Vercel URL here later
    credentials: true
}));

// Use memory storage so your cloud server doesn't write files to disk
const upload = multer({ storage: multer.memoryStorage() });

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to Cloud MongoDB Atlas.'))
    .catch(err => console.error('MongoDB connection failure:', err));

// --- Database Schemas ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, required: false, unique: true, sparse: true },
    profilePic: { type: String, required: false }
});

const PatientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const ScanSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    prediction: { type: String, required: true },
    confidence: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Patient = mongoose.model('Patient', PatientSchema);
const Scan = mongoose.model('Scan', ScanSchema);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access token authorization missing.' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) return res.status(403).json({ error: 'Session token invalid or expired.' });
        req.user = decodedUser;
        next();
    });
};

// --- Authentication Endpoints ---
app.post('/api/auth/register', async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return res.status(400).json({ error: 'All fields required.' });
    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) return res.status(400).json({ error: 'Account already exists.' });
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const newUser = new User({ email, name, passwordHash: hashed });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id, name: newUser.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password = "" } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials.' });
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials.' });
        const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        res.json({ authenticated: true, user: { id: user._id, name: user.name, email: user.email, profilePic: user.profilePic } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- Secure AI Inference Forwarding Route to Hugging Face ---
app.post('/api/predict', authenticateToken, upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded.' });
    const { patient_name } = req.body;
    if (!patient_name || !patient_name.trim()) return res.status(400).json({ error: 'Patient name required.' });

    try {
        let patient = await Patient.findOne({ name: patient_name.trim(), doctorId: req.user.id });
        if (!patient) {
            patient = new Patient({ name: patient_name.trim(), doctorId: req.user.id });
            await patient.save();
        }

        // Convert memory buffer to network Blob data
        const fileBlob = new Blob([req.file.buffer], { type: req.file.mimetype });
        const formData = new FormData();
        formData.append("file", fileBlob, req.file.originalname);

        console.log("Forwarding to Hugging Face live AI Space...");
        const response = await fetch(process.env.HF_SPACE_URL, {
            method: 'POST',
            body: formData
        });

        const parsedResult = await response.json();
        if (!response.ok) return res.status(500).json({ error: 'Cloud AI inference server returned an error.' });

        const newScan = new Scan({
            patientId: patient._id,
            prediction: parsedResult.prediction,
            confidence: parsedResult.confidence
        });
        await newScan.save();

        res.json({
            id: newScan._id,
            patient: patient.name,
            prediction: newScan.prediction,
            confidence: newScan.confidence,
            timestamp: newScan.timestamp.toISOString()
        });

    } catch (err) {
        console.error("Gateway error:", err);
        res.status(500).json({ error: 'Failed to communicate with the cloud AI model gateway.' });
    }
});

app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const matchingPatients = await Patient.find({ doctorId: req.user.id });
        const patientIds = matchingPatients.map(p => p._id);
        const databaseScans = await Scan.find({ patientId: { $in: patientIds } }).populate('patientId', 'name').sort({ timestamp: -1 });
        res.json(databaseScans.map(scan => ({ id: scan._id, patient: scan.patientId.name, prediction: scan.prediction, confidence: scan.confidence, timestamp: scan.timestamp.toISOString() })));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Gateway node manager fully online on port ${PORT}`));