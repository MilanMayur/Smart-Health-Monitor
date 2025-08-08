#app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app, supports_credentials=True) # No browser support

# Load all models
diabetes_model = joblib.load('model/diabetes_model.pkl')
heart_model = joblib.load('model/heart_model.pkl')
stroke_model = joblib.load('model/stroke_model.pkl')

# Helper Functions
def get_risk_category(prob):
    if prob < 0.3:
        return "Low"
    elif prob < 0.7:
        return "Moderate"
    else:
        return "High"

def clamp(value, min_val, max_val):
    return max(min_val, min(value, max_val))

@app.route('/')
def index():
    return "Flask is running!"

@app.route('/predict-diabetes', methods=['POST'])
def predict_diabetes():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400
    print("Received data:", data)
    try:
        # Defaults if values are missing or empty
        input_data = {
            'pregnancies': int(data.get('pregnancies', 0)),
            'glucose': float(data.get('glucose', 100)),
            'bloodPressure': float(data.get('bloodPressure', 80)),
            'skinThickness': float(data.get('skinThickness', 29)),
            'insulin': float(data.get('insulin', 79.8)),
            'bmi': float(data.get('bmi', 25.0)),
            'diabetesPedigreeFunction': float(data.get('diabetesPedigreeFunction', 0.47)),
            'age': int(data.get('age'))
        }

        input_df = pd.DataFrame([input_data])

        # Predict probability
        proba = diabetes_model.predict_proba(input_df)[:, 1]
        proba = float(proba[0])
        threshold = 0.3
        result = "Positive" if proba > threshold else "Negative"
        category = get_risk_category(proba)

        return jsonify({
            'probability': round(proba * 100, 2), 
            'prediction': result,
            'riskCategory': category
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500 

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
        'restingBloodPressure': int(data.get('bloodPressure', 120)),
        'serumCholestoral': clamp(int(data.get('serumCholestoral', 200)), 126, 564),
        'fastingBloodSugar': 1 if int(data.get('fastingBloodSugar', 0)) > 120 else 0,
        'restingECG': float(data.get('restingECG', 0)),
        'maxHeartRate': clamp(int(data.get('maxHeartRate', 150)), 71, 202),
        'exerciseInducedAngina': int(data.get('exerciseInducedAngina', 0)),
        'oldpeak': float(data.get('oldpeak', 0.0)),
        'stSegment': int(data.get('stSegment', 1)),
        'majorVessels': int(data.get('majorVessels', 0)),
        'thalassemia': int(data.get('thalassemia', 2))
        }

        input_df = pd.DataFrame([input_data])

        # Predict probability
        proba = heart_model.predict_proba(input_df)[0:, 1]
        proba = float(proba[0])
        threshold = 0.3
        result = "Positive" if proba > threshold else "Negative"
        category = get_risk_category(proba)

        return jsonify({
            'probability': round(proba * 100, 2), 
            'prediction': result,
            'riskCategory': category
        })
    except Exception as e:
        print("FULL TRACEBACK:")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500 

@app.route('/predict-stroke', methods=['POST'])
def predict_stroke():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400
    try:
        input_data = {
            "gender": data.get("sex"),
            "age": int(data["age"]),
            "hypertension": int(data["hypertension"]),
            "heartDisease": int(data["heartDisease"]),
            "married": data["married"],
            "workType": data["workType"],
            "residenceType": data["residenceType"],
            "glucose": float(data["glucose"]),
            "bmi": float(data["bmi"]),
            "smokingStatus": data["smokingStatus"],
        }

        input_df = pd.DataFrame([input_data])

        # Predict probability
        proba = stroke_model.predict_proba(input_df)[:, 1]
        proba = float(proba[0])
        threshold = 0.3
        prediction = "Positive" if proba > threshold else "Negative"
        risk = get_risk_category(proba)

        return jsonify({
            'probability': round(proba * 100, 2), 
            'prediction': prediction,
            'riskCategory': risk
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)



