#app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# Load all models
diabetes_model = joblib.load('model/diabetes_model.pkl')
heart_model = joblib.load('model/heart_model.pkl')
stroke_model = joblib.load('model/stroke_model.pkl')

# Helper Functions
def parse_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default

def parse_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default
 
def get_risk_category(prob):
    if prob < 0.3:
        return "Low"
    elif prob < 0.7:
        return "Moderate"
    else:
        return "High"

def clamp(value, min_val, max_val):
    return max(min_val, min(value, max_val))

@app.route('/predict-diabetes', methods=['POST'])
def predict_diabetes():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400
    print("Received data:", data)
    try:
        # Defaults if values are missing or empty
        input_data = {
            'pregnancies': int(data.get('pregnancies')),
            'glucose': float(data.get('glucose', 100)),
            'bloodPressure': float(data.get('bloodPressure', 80)),
            'skinThickness': float(data.get('skinThickness', 29)),
            'insulin': float(data.get('insulin', 79.8)),
            'bmi': float(data.get('bmi', 25.0)),
            'diabetesPedigreeFunction': float(data.get('diabetesPedigreeFunction', 0.47)),
            'age': int(data.get('age'))
        }

        # Create a DataFrame with a single row
        input_df = pd.DataFrame([input_data])

        # Predict probability
        proba = diabetes_model.predict_proba(input_df)[0][1]
        threshold = 0.3
        result = "Positive" if proba > threshold else "Negative"
        category = get_risk_category(proba)

        return jsonify({
            'probability': round(proba * 100, 2), 
            'prediction': result,
            'riskCategory': category
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500 #400

@app.route('/predict-heart', methods=['POST'])
def predict_heart():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400
    print("Received data:", data)
    try:
        # Defaults if values are missing or empty
        input_data = {
            'age': int(data.get('age')),
            'sex': int(data.get('sex')),
            'chestPainType': int(data.get('chestPainType', 3)),
            'restingBloodPressure': float(data.get('restingBloodPressure', 120)),
            'serumCholestoral': clamp(float(data.get('serumCholestoral', 200)), 126, 564),
            'fastingBloodSugar': 1.0 if float(data.get('fastingBloodSugar', 0)) > 120 else 0.0,
            'restingECG': float(data.get('restingECG', 0)),
            'maxHeartRate': clamp(float(data.get('maxHeartRate', 150)), 71, 202),
            'exerciseInducedAngina': float(data.get('exerciseInducedAngina', 0)),
            'oldpeak': float(data.get('oldpeak', 0.0)),
            'stSegment': float(data.get('stSegment', 1)),
            'majorVessels': float(data.get('majorVessels', 0)),
            'thalassemia': float(data.get('thalassemia', 2))
        }
        
        # Create DataFrame with correct structure
        input_df = pd.DataFrame([input_data])
        print("Input:",input_data)

        # Predict probability
        proba = heart_model.predict_proba(input_df)[0][1]
        threshold = 0.3
        result = "Positive" if proba > threshold else "Negative"
        category = get_risk_category(proba)

        return jsonify({
            'probability': round(proba * 100, 2), 
            'prediction': result,
            'riskCategory': category
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500 #400

@app.route('/predict-stroke', methods=['POST'])
def predict_stroke():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400
    try:
        # Defaults if values are missing or null
        input_data = {
            'gender': data.get('gender'),
            'age': int(data.get('age')),
            'hypertension': int(data.get('hypertension', 0)),
            'heartDisease': int(data.get('heartDisease', 0)),
            'married': data.get('married'),
            'workType': data.get('workType'),
            'residenceType': data.get('residenceType'),
            'glucose': float(data.get('glucose', 100)),
            'bmi': float(data.get('bmi', 25.0)),
            'smokingStatus': data.get('smokingStatus')
        }
        print("Input data:",input_data)

        # Create input DataFrame
        input_df = pd.DataFrame([input_data])

        # Predict probability
        proba = stroke_model.predict_proba(input_df)[0][1]
        threshold = 0.3
        prediction = "Positive" if proba > threshold else "Negative"
        risk = get_risk_category(proba)

        return jsonify({
            'probability': round(float(proba) * 100, 2), 
            'prediction': prediction,
            'riskCategory': risk
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
