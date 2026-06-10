import sys
import os
import json
import numpy as np

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Suppress internal TensorFlow logs

try:
    from tensorflow.keras.models import load_model
    from tensorflow.keras.preprocessing.image import img_to_array, load_img
except ImportError:
    print(json.dumps({"error": "TensorFlow or Pillow dependencies missing in system environment."}))
    sys.exit(1)

def run_inference(image_path):
    model_path = os.path.join(os.path.dirname(__file__), 'skin_cancer_cnn.h5')
    
    if not os.path.exists(model_path):
        print(json.dumps({"error": f"Model file not found at {model_path}"}))
        sys.exit(1)
        
    try:
        model = load_model(model_path)
        img = load_img(image_path, target_size=(224, 224))
        img_array = img_to_array(img)
        img_array = img_array / 255.0  # Normalize pixel scale
        img_array = np.expand_dims(img_array, axis=0)

        prediction_score = float(model.predict(img_array)[0][0])

        if prediction_score >= 0.5:
            label = "Malignant"
            confidence = prediction_score
        else:
            label = "Benign"
            confidence = 1.0 - prediction_score

        print(json.dumps({"prediction": label, "confidence": confidence}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing image path argument vector."}))
        sys.exit(1)
    run_inference(sys.argv[1])