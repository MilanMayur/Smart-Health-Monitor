import pandas as pd
import joblib

# Sample input
heart_inputs = pd.DataFrame([
    {               #low
        'age': 45,
        'sex': 1,
        'chestPainType': 3,
        'restingBloodPressure': 130,
        'serumCholestoral': 230,
        'fastingBloodSugar': 0,
        'restingECG': 1,
        'maxHeartRate': 170,
        'exerciseInducedAngina': 0,
        'oldpeak': 0.5,
        'stSegment': 2,
        'majorVessels': 0,
        'thalassemia': 2
    },
    {               #moderate
        'age': 60,
        'sex': 0,
        'chestPainType': 2,
        'restingBloodPressure': 140,
        'serumCholestoral': 290,
        'fastingBloodSugar': 1,
        'restingECG': 2,
        'maxHeartRate': 120,
        'exerciseInducedAngina': 1,
        'oldpeak': 2.5,
        'stSegment': 1,
        'majorVessels': 2,
        'thalassemia': 3
    }
])

# Load trained model
model = joblib.load('model/heart_model.pkl')

print(model.feature_names_in_)

# Define risk category logic
def get_risk_category(prob):
    if prob < 0.3:
        return "Low"
    elif prob < 0.7:
        return "Moderate"
    return "High"

# Predict probabilities
probas = model.predict_proba(heart_inputs)[:, 1]
threshold = 0.3  

# Display predictions
for i, prob in enumerate(probas):
    prediction = "Positive" if prob > threshold else "Negative"
    category = get_risk_category(prob)
    print(f"\nInput {i+1}:")
    print(f"  Heart Disease Probability: {prob * 100:.2f}%")
    print(f"  Prediction: {prediction}")
    print(f"  Risk Category: {category}")

