import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'http://localhost:5000/api';
const GOOGLE_CLIENT_ID = '834381178930-sjeutp47at4qkfim5rnba1qsim5udoss.apps.googleusercontent.com';

export default function App() {
  const [view, setView] = useState('home');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setAuthLoading(false); return; }
    
    fetch(`${API_URL}/auth/me`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => { if (data.authenticated) setUser(data.user); })
      .catch(() => { localStorage.removeItem('token'); setUser(null); })
      .finally(() => setAuthLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setView('home');
  };

  if (authLoading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="app-container">
      <header className="site-header">
        <div className="navbar">
          <button className="logo-brand" onClick={() => setView('home')}>
            <span className="brand-icon">🔬</span> DermSight <span className="brand-accent">Clinical</span>
          </button>
          <ul className="nav-links">
            <li><button className={`nav-link-btn ${view === 'home' ? 'active' : ''}`} onClick={() => setView('home')}>Overview</button></li>
            <li><button className={`nav-link-btn ${view === 'education' ? 'active' : ''}`} onClick={() => setView('education')}>Clinical Resources</button></li>
            <li><button className={`nav-link-btn ${view === 'dashboard' ? 'active' : ''}`} onClick={() => user ? setView('dashboard') : setView('login')}>Analysis Workspace</button></li>
            <li><button className="utility-theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '🌙 Night Mode' : '☀️ Day Mode'}</button></li>
            {user ? (
              <>
                <li className="medical-profile-badge">
                  <img className="clinical-avatar" src={user.profilePic || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100'} alt="Practitioner Avatar" />
                  <span className="practitioner-name">{user.name}</span>
                </li>
                <li><button className="auth-action-btn exit-btn" onClick={handleLogout}>Exit Portal</button></li>
              </>
            ) : (
              <li><button className="auth-action-btn enter-btn" onClick={() => setView('login')}>Provider Login</button></li>
            )}
          </ul>
        </div>
      </header>

      <main className="main-content-wrapper">
        {view === 'home' && <HomeView onLaunch={() => user ? setView('dashboard') : setView('login')} setView={setView} />}
        {view === 'education' && <EducationView />}
        {view === 'login' && <LoginView onAuthSuccess={(u) => { setUser(u); setView('dashboard'); }} />}
        {view === 'dashboard' && <DashboardView user={user} />}
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div>&copy; 2026 DermSight Medical Systems. Certified Clinical Assessment Framework.</div>
          <div className="footer-disclaimer">Protected Healthcare Information Pipeline. Confidential Medical Use Only.</div>
        </div>
      </footer>
    </div>
  );
}

function HomeView({ onLaunch, setView }) {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-text-block">
          <div className="clinical-tag">Next-Gen Dermoscopy Framework</div>
          <h1>Advanced Deep Learning Analysis for <span>Lesion Classification</span></h1>
          <p>Streamlining clinical analysis workflows. Securely upload dermatological high-fidelity imagery to execute objective computational checks against validated neural metrics.</p>
          <div className="hero-button-group">
            <button className="primary-action-btn" onClick={onLaunch}>Initialize Analysis Engine</button>
            <button className="secondary-action-btn" onClick={() => setView('education')}>Review Evaluation Criteria</button>
          </div>
        </div>
        <div className="hero-image-frame">
          <img src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800" alt="Clinical Evaluation Environment" />
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <span className="feature-icon">🛡️</span>
          <h3>Objective Pre-Screening</h3>
          <p>Provides data-driven triage indicators to optimize surgical or biopsy prioritization workflows.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">📈</span>
          <h3>Automated Case Records</h3>
          <p>Securely aggregates and traces structural evaluations over time, keeping patient logs centralized for clinical reviews.</p>
        </div>
        <div className="feature-card">
          <span className="feature-icon">⚡</span>
          <h3>Sub-Second Inference</h3>
          <p>Utilizes dedicated sidecar application clusters to resolve spatial matrix probabilities almost instantly.</p>
        </div>
      </div>
    </div>
  );
}

function EducationView() {
  return (
    <div className="education-container">
      <div className="medical-header">
        <h2>Dermatological Reference & Assessment Guidelines</h2>
        <p>Clinical resource guide for evaluating cutaneous lesions and identifying key warning markers of melanocytic malignancy.</p>
      </div>

      <div className="abcde-showcase">
        <h3>The ABCDE Clinical Tracking Framework</h3>
        <div className="abcde-grid">
          <div className="abcde-card">
            <div className="abcde-letter">A</div>
            <h4>Asymmetry</h4>
            <p>One half of the cutaneous lesion layout does not mirror or match the structural orientation of the opposite half.</p>
          </div>
          <div className="abcde-card">
            <div className="abcde-letter">B</div>
            <h4>Border</h4>
            <p>The margins are irregular, poorly defined, ragged, notched, or gradually blur out into surrounding healthy tissue layers.</p>
          </div>
          <div className="abcde-card">
            <div className="abcde-letter">C</div>
            <h4>Color</h4>
            <p>Pigmentation varies unevenly across the lesion area, displaying chaotic shades of brown, black, red, pink, blue, or white.</p>
          </div>
          <div className="abcde-card">
            <div className="abcde-letter">D</div>
            <h4>Diameter</h4>
            <p>Melanomas typically exceed 6mm in size (roughly the width of a pencil eraser), though they can present smaller.</p>
          </div>
          <div className="abcde-card">
            <div className="abcde-letter">E</div>
            <h4>Evolving</h4>
            <p>The skin lesion changes shape, absolute size, colors, elevation profile, or initiates secondary responses like localized bleeding or itching.</p>
          </div>
        </div>
      </div>

      <div className="clinical-imagery-section">
        <h3>Dermatoscopic Morphology Reference Examples</h3>
        <div className="medical-images-flex">
          <div className="image-clinical-wrapper">
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400" alt="Dermatoscopic lesion inspection" />
            <h5>Melanocytic Lesion Under Review</h5>
          </div>
          <div className="image-clinical-wrapper">
            <img src="https://images.unsplash.com/photo-1628863040733-231cb33be38e?w=400" alt="Clinical laboratory scan verification" />
            <h5>Spatial Structural Mapping</h5>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginView({ onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const googleBtnRef = useRef(null);

  useEffect(() => {
    const initGoogleAuth = () => {
      try {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback
          });
          window.google.accounts.id.renderButton(googleBtnRef.current, { 
            type: 'standard', 
            size: 'large', 
            width: '340' 
          });
        }
      } catch (e) {
        console.error("Identity component mount failure:", e);
      }
    };

    if (!document.getElementById('google-sdk-script')) {
      const script = document.createElement('script'); 
      script.id = 'google-sdk-script';
      script.src = 'https://accounts.google.com/gsi/client'; 
      script.async = true; 
      script.defer = true;
      script.onload = () => initGoogleAuth(); 
      document.head.appendChild(script);
    } else {
      const timer = setTimeout(() => initGoogleAuth(), 100);
      return () => clearTimeout(timer);
    }
  }, [isRegister]);

  const handleGoogleCallback = async (response) => {
    try {
      const res = await fetch(`${API_URL}/auth/google`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ token: response.credential }) 
      });

      if (!res.ok) {
        const errorText = await res.text();
        setError(`Verification Failure: ${errorText.substring(0, 50)}`);
        return;
      }

      const data = await res.json();
      if (data.token) { 
        localStorage.setItem('token', data.token); 
        onAuthSuccess(data.user); 
      }
    } catch (err) { 
      setError(`Network Handshake Exception: ${err.message}`); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name, password }) });
      const data = await res.json();
      if (res.ok && data.token) { localStorage.setItem('token', data.token); onAuthSuccess(data.user); } 
      else { setError(data.error || 'Identity access error.'); }
    } catch (err) { setError('The authentication service is currently unreachable.'); }
  };

  return (
    <div className="login-wrapper-panel">
      <div className="medical-form-card">
        <h2>{isRegister ? 'Register Practitioner Account' : 'Clinical Access Portal'}</h2>
        <p className="form-subtitle">Authorized Medical and Investigative Personnel Only</p>
        
        {error && <div className="clinical-error-alert">{error}</div>}
        
        <div className="google-auth-node" ref={googleBtnRef}></div>
        
        <div className="form-divider"><span>OR CONTINUE WITH CREDENTIALS</span></div>
        
        <form onSubmit={handleSubmit}>
          {isRegister && <div className="form-input-block"><label>Full Legal Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Dr. John Doe" /></div>}
          <div className="form-input-block"><label>Institutional Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@institution.org" /></div>
          <div className="form-input-block"><label>Secure Access Password</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" /></div>
          <button type="submit" className="form-submit-btn">{isRegister ? 'Complete Registration' : 'Authenticate Credentials'}</button>
        </form>
        
        <button className="form-view-toggle-btn" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already registered? Sign In' : 'Need institutional access? Request account here'}
        </button>
      </div>
    </div>
  );
}

function DashboardView({ user }) {
  const [patientName, setPatientName] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const fetchLogs = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/history`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setHistory(data));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleAnalyze = async () => {
    if (!file || !patientName.trim()) return;
    setAnalyzing(true);
    const formData = new FormData(); 
    formData.append('file', file); 
    formData.append('patient_name', patientName.trim());

    try {
      const res = await fetch(`${API_URL}/predict`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData });
      const data = await res.json();
      if (res.ok) { setResult(data); fetchLogs(); } 
      else { alert('Analysis Error: ' + data.error); }
    } catch (err) { alert('Diagnostic connection loss.'); } 
    finally { setAnalyzing(false); }
  };

  // 🗑️ ADVANCED FEATURE: Delete a Single Case Entry
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to purge this specific diagnostic record?")) return;
    
    // Optimistic UI update: remove item from state instantly so the UI feels fluid
    setHistory(history.filter(item => item.id !== itemId));

    try {
      await fetch(`${API_URL}/history/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error("Purge failure:", err);
      fetchLogs(); // Reload historical log if database sync fails
    }
  };

  // 🗑️ ADVANCED FEATURE: Purge the Entire Evaluation History Ledger
  const handleClearAllHistory = async () => {
    if (!window.confirm("CRITICAL WARNING: You are about to permanently delete ALL evaluation case history records. This cannot be undone. Proceed?")) return;

    setHistory([]); // Optimistic layout reset

    try {
      await fetch(`${API_URL}/history`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
    } catch (err) {
      console.error("Ledger wipe failure:", err);
      fetchLogs();
    }
  };

  const radius = 45; 
  const circumference = radius * 2 * Math.PI;
  const pct = result ? result.confidence * 100 : 0;
  const offset = circumference - (pct / 100) * circumference;
  const isMalignant = result?.prediction === 'Malignant';
  const color = isMalignant ? '#dc2626' : '#16a34a';

  return (
    <div className="dashboard-layout-container">
      <div className="workspace-main-panel">
        <div className="clinical-card">
          <div className="card-header-title">📋 Run Diagnostic Evaluation</div>
          
          <div className="form-input-block">
            <label>Patient Full Name / Identifer Token</label>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required placeholder="e.g. Anonymous Patient Case #84B" />
          </div>
          
          <div className="upload-drop-zone" onClick={() => document.getElementById('file-el').click()}>
            {!previewUrl ? (
              <div className="upload-prompt">
                <span className="upload-icon">📷</span>
                <p>Click or drag dermatoscopic lesion scan file here</p>
                <span className="file-restriction-text">Supports medical JPG, PNG, and TIFF imaging dimensions</span>
              </div>
            ) : (
              <div className="preview-container">
                <img id="preview" src={previewUrl} alt="Patient scan preview target" />
              </div>
            )}
            <input type="file" id="file-el" style={{ display: 'none' }} accept="image/*" onChange={(e) => { if(e.target.files.length) { setFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} />
          </div>
          
          <button className="primary-action-btn run-analysis-btn" disabled={analyzing || !file || !patientName.trim()} onClick={handleAnalyze}>
            {analyzing ? 'Processing Structural Matrix...' : 'Run Diagnostics Analysis'}
          </button>

          {result && (
            <div className="clinical-results-box">
              <div className="results-metadata">
                <div className="case-subject-title">Subject Case: {result.patient}</div>
                <span className="evaluation-metric-label">Assessment Result</span>
                <div className="evaluation-output-class" style={{ color }}>
                  {result.prediction} {isMalignant ? '⚠️' : '✅'}
                </div>
              </div>
              <div className="gauge-circular-wrapper">
                <svg width="110" height="110" className="progress-ring-circle">
                  <circle stroke="var(--border-subtle)" strokeWidth="8" fill="transparent" r={radius} cx="55" cy="55"/>
                  <circle className="animated-ring-path" stroke={color} strokeWidth="8" fill="transparent" r={radius} cx="55" cy="55" style={{ strokeDasharray: `${circumference} ${circumference}`, strokeDashoffset: offset }} />
                </svg>
                <div className="gauge-percentage-text">{pct.toFixed(1)}%</div>
                <div className="gauge-confidence-subtext">Confidence Score</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="workspace-sidebar-panel">
        <div className="clinical-card ledger-card">
          <div className="ledger-header-row">
            <div className="card-header-title">📑 Case History Ledger</div>
            {history.length > 0 && (
              <button className="purge-all-btn" onClick={handleClearAllHistory}>Clear All Logs</button>
            )}
          </div>
          <ul className="history-list-element">
            {history.length === 0 ? (
              <li className="empty-ledger-notice">No history entries registered to this active account file.</li>
            ) : (
              history.map(item => (
                <li className="history-case-row-item" key={item.id}>
                  <div className="history-case-meta">
                    <strong>{item.patient}</strong>
                    <div className="history-case-timestamp">
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="history-case-confidence">Score Matrix: {(item.confidence*100).toFixed(1)}%</div>
                  </div>
                  <div className="history-case-actions">
                    <span className={`clinical-badge ${item.prediction === 'Malignant' ? 'badge-malig' : 'badge-ben'}`}>{item.prediction}</span>
                    <button className="individual-delete-btn" title="Purge Record" onClick={() => handleDeleteItem(item.id)}>🗑️</button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}