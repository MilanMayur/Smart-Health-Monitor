#heart_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.svm import SVC
import joblib

# Load heart dataset
heart = pd.read_csv('../dataset/heart.csv')

# Rename headers
heart.rename(columns = {
    'sex ': 'sex',
    'chest pain type': 'chestPainType',
    'resting blood pressure': 'restingBloodPressure',
    'serum cholestoral': 'serumCholestoral',
    'fasting blood sugar': 'fastingBloodSugar',
    'resting electrocardiographic results': 'restingECG',
    'max heart rate': 'maxHeartRate',
    'exercise induced angina': 'exerciseInducedAngina',
    'oldpeak': 'oldpeak',
    'ST segment': 'stSegment',
    'major vessels': 'majorVessels',
    'thal': 'thalassemia',
    'heart disease': 'target'
}, inplace=True)

X = heart.drop('target', axis=1)
y = heart['target']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
y_train = y_train.replace({1: 0, 2: 1})
y_test = y_test.replace({1: 0, 2: 1})

# Define sklearn model configurations
models = {
    "Logistic Regression": {
        "model": LogisticRegression(max_iter=1000),
        "params": {
            "model__C": [0.01, 0.1, 1, 10],
            "model__solver": ['liblinear', 'lbfgs'],
        },
    },
    "Random Forest": {
        "model": RandomForestClassifier(),
        "params": {
            "model__n_estimators": [100, 200],
            "model__max_depth": [None, 5, 10],
            "model__min_samples_split": [2, 5],
        },
    },
    "SVM": {
        "model": SVC(probability=True),
        "params": {
            "model__C": [0.1, 1, 10],
            "model__kernel": ['linear', 'rbf'],
        },
    }
}

best_models = {}
test_accuracies = {}

print("\n--- Training and Tuning Models ---")

for name, cfg in models.items():
    print(f"\nTraining {name}...")
    pipe = Pipeline([
        ('scaler', StandardScaler()),
        ('model', cfg['model'])
    ])

    grid = GridSearchCV(pipe, cfg['params'], 
                        cv=5, scoring='accuracy', 
                        n_jobs=1, error_score='raise')
    grid.fit(X_train, y_train)

    best_models[name] = grid
    y_pred = grid.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    test_accuracies[name] = acc

    print(f"Best Parameters for {name}: {grid.best_params_}")
    print(f"Validation Accuracy: {grid.best_score_:.4f}")

# Manually train and tune XGBoost
print("\nTraining XGBoost...")

xgb_params = {
    "n_estimators": [100, 200],
    "max_depth": [3, 5],
    "learning_rate": [0.01, 0.1],
}

xgb = XGBClassifier(eval_metric='logloss', use_label_encoder=False, verbosity=0)
grid_xgb = GridSearchCV(xgb, xgb_params, 
                        cv=5, scoring='accuracy', 
                        n_jobs=1, error_score='raise')
grid_xgb.fit(X_train, y_train)

best_models["XGBoost"] = grid_xgb
y_pred = grid.predict(X_test)
acc = accuracy_score(y_test, y_pred)
test_accuracies["XGBoost"] = acc

print(f"Best Parameters for XGBoost: {grid_xgb.best_params_}")
print(f"Validation Accuracy: {grid_xgb.best_score_:.4f}")

# Evaluate on test set
print("\n--- Test Set Evaluation ---")
results = {}
for name, model in best_models.items():
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    
    results[name] = acc
    print(f"\n{name} Test Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

# Ranking by Test Accuracy
print("\nModel Ranking by Test Accuracy:")
for rank, (model_name, acc) in enumerate(sorted(results.items(), key=lambda x: x[1], reverse=True), 1):
    print(f"{rank}. {model_name} - Test Accuracy: {acc:.4f}")

# Save best model
best_model_name = max(test_accuracies, key=test_accuracies.get)
joblib.dump(best_models[best_model_name], 'model/heart_model.pkl')
print(f"\nBest model '{best_model_name}' saved to heart_model.pkl")

