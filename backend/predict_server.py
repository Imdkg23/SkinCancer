import os
import io
import numpy as np
import tensorflow as tf
from fastapi import FastAPI, HTTPException, UploadFile, File
from PIL import Image

# Initialize the cloud FastAPI engine
app = FastAPI(title="DermAI Cloud AI Engine")

# This will look for the model file directly in your Hugging Face space directory
MODEL_PATH = "skin_cancer_efficientnet.keras" 

print("[STARTUP] Loading TensorFlow model into RAM... Please wait.")
model = tf.keras.models.load_model(MODEL_PATH)
print("[STARTUP] Model loaded successfully! Listening for web requests.")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Read the uploaded image bytes directly from the network request
        contents = await file.read()
        
        # Open the image and prepare it for EfficientNet/CNN geometry
        img = Image.open(io.BytesIO(contents)).convert('RGB').resize((224, 224))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Run matrix model prediction graphs
        predictions = model.predict(img_array)
        score = float(predictions[0][0])

        # Map thresholds to clinical labels
        prediction_label = "Malignant" if score > 0.5 else "Benign"
        confidence_metric = score if prediction_label == "Malignant" else (1.0 - score)

        return {
            "prediction": prediction_label, 
            "confidence": confidence_metric
        }
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Inference gateway failure: {str(err)}")