#diabetes_predict.py
import pandas as pd
import joblib

# Example raw user input
diabetes_input = pd.DataFrame([
{
    'pregnancies': 1,
    'glucose': 95,
    'bloodPressure': 70,
    'skinThickness': 20,
    'insulin': 85,
    'bmi': 22.0,
    'diabetesPedigreeFunction': 0.2,
    'age': 30
},
{
    'pregnancies': 4,
    'glucose': 160,
    'bloodPressure': 80,
    'skinThickness': 30,
    'insulin': 130,
    'bmi': 33.0,
    'diabetesPedigreeFunction': 0.5,
    'age': 50
},
{
    'pregnancies': 6,
    'glucose': 200,
    'bloodPressure': 90,
    'skinThickness': 35,
    'insulin': 180,
    'bmi': 45.0,
    'diabetesPedigreeFunction': 1.2,
    'age': 60
}])

# Load trained diabetes model
diabetes_model = joblib.load('model/diabetes_model.pkl')

# Predict probabilities
probas = diabetes_model.predict_proba(diabetes_input)[:, 1]
threshold = 0.3

# Predict and categorize
def get_risk_category(probability):
    if probability < 0.3:
        return "Low"
    elif 0.3 <= probability < 0.7:
        return "Moderate"
    else:
        return "High"
    
# Process each input
for i, record in diabetes_input.iterrows():
    input_df = pd.DataFrame([record])
    proba = diabetes_model.predict_proba(input_df)[0][1]
    category = get_risk_category(proba)
    result = "Positive" if proba > 0.3 else "Negative"
    
    print(f"\nInput {i}:")
    print(f"  Diabetes Probability: {proba * 100:.2f}%")
    print(f"  Prediction: {result}")
    print(f"  Risk Category: {category}")
