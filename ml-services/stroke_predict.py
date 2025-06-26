import pandas as pd
import joblib

# Raw user input (NOT one-hot encoded)
stroke_input = pd.DataFrame([
{          #low
    'gender': 'Female',
    'age': 35,
    'hypertension': 0,
    'heartDisease': 0,
    'married': 'No',
    'workType': 'Private',
    'residenceType': 'Urban',
    'glucose': 95.0,
    'bmi': 22.0,
    'smokingStatus': 'never smoked',
},
{          #medium
    'gender': 'Male',
    'age': 82,
    'hypertension': 1,
    'heartDisease': 1,
    'married': 'Yes',
    'workType': 'Self-employed',
    'residenceType': 'Urban',
    'glucose': 260.0,
    'bmi': 47.0,
    'smokingStatus': 'smokes'
},
{          #high
    'gender': 'Male',
    'age': 85,
    'hypertension': 1,
    'heartDisease': 1,
    'married': 'Yes',
    'workType': 'Never_worked',
    'residenceType': 'Urban',
    'glucose': 280.0,
    'bmi': 45.0,
    'smokingStatus': 'smokes'
}])

# Load trained pipeline model
stroke_model = joblib.load('model/stroke_model.pkl')

# Predict and categorize
def get_risk_category(probability):
    if probability < 0.3:
        return "Low"
    elif 0.3 <= probability < 0.7:
        return "Moderate"
    else:
        return "High"

# Process each input
for i, record in stroke_input.iterrows():
    input_df = pd.DataFrame([record])
    proba = stroke_model.predict_proba(input_df)[0][1]
    category = get_risk_category(proba)
    result = "Positive" if proba > 0.3 else "Negative"
    
    print(f"\nInput {i}:")
    print(f"  Stroke Probability: {proba * 100:.2f}%")
    print(f"  Prediction: {result}")
    print(f"  Risk Category: {category}")
    