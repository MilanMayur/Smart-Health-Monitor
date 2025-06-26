#stroke_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.metrics import classification_report, accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.svm import SVC
from imblearn.over_sampling import SMOTE
import joblib
import warnings
warnings.filterwarnings('ignore')

# Load dataset
stroke = pd.read_csv('../dataset/stroke.csv')

# Rename headers
stroke.rename(columns={
    'heart_disease': 'heartDisease',
    'ever_married': 'married',
    'work_type': 'workType',
    'Residence_type': 'residenceType',
    'avg_glucose_level': 'glucose',
    'bmi': 'bmi',
    'smoking_status': 'smokingStatus',
    'stroke': 'target'
}, inplace=True)

# Drop 'id' column
stroke.drop('id', axis=1, inplace=True)

# Fill missing BMI with mean
stroke['bmi'] = stroke['bmi'].fillna(stroke['bmi'].mean())

# Define categorical/numeric columns
categorical_cols = ['gender', 'married', 'workType', 'residenceType', 'smokingStatus']
numeric_cols = ['age', 'hypertension', 'heartDisease', 'glucose', 'bmi']

X = stroke[categorical_cols + numeric_cols]
y = stroke['target']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Preprocessing: OneHot for categorical, scaling for numeric
preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), numeric_cols),
        ('cat', OneHotEncoder(handle_unknown='ignore', 
                              sparse_output=False), 
                              categorical_cols) 
    ]
)

# Define model configurations
models = {
    "Logistic Regression": {
        "model": LogisticRegression(max_iter=1000, class_weight='balanced'),
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
    "XGBoost": {
        "model": XGBClassifier(eval_metric='logloss', use_label_encoder=False, verbosity=0),
        "params": {
            "model__n_estimators": [100, 200],
            "model__max_depth": [3, 5, 7],
            "model__learning_rate": [0.01, 0.1, 0.2],
        },
    },
    "SVM": {
        "model": SVC(class_weight='balanced'),
        "params": {
            "model__C": [0.1, 1, 10],
            "model__kernel": ['linear', 'rbf'],
        },
    },
}

best_models = {}
test_accuracies = {}

print("\n--- Training and Tuning Models ---")

for name, cfg in models.items():
    print(f"\nTraining {name}...")
    pipe = ImbPipeline([
        ('preprocessor', preprocessor),
        ('smote', SMOTE(random_state=42)),
        ('model', cfg['model'])
    ])

    grid = GridSearchCV(pipe, cfg['params'], 
                        cv=5, scoring='accuracy', 
                        n_jobs=1,error_score='raise')
    grid.fit(X_train, y_train)

    best_models[name] = grid
    y_pred = grid.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    test_accuracies[name] = acc

    print(f"Best Parameters for {name}: {grid.best_params_}")
    print(f"Validation Accuracy: {grid.best_score_:.4f}")

# Debug
#fitted_preprocessor = grid.best_estimator_.named_steps['preprocessor']
#fitted_encoder = fitted_preprocessor.named_transformers_['cat']
#print("Categories learned by encoder:", fitted_encoder.categories_)

# Evaluate on test set
print("\n--- Test Set Evaluation ---")
for name, model in best_models.items():
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n{name} Test Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred, zero_division=0))

# Ranking by Test Accuracy
print("\nModel Ranking by Test Accuracy:")
for rank, (name, acc) in enumerate(sorted(test_accuracies.items(), 
                                          key=lambda x: x[1], 
                                          reverse=True), 1):
    print(f"{rank}. {name} - Test Accuracy: {acc:.4f}")

# Save best model
best_model_name = max(test_accuracies, key=test_accuracies.get)
joblib.dump(best_models[best_model_name], 'model/stroke_model.pkl')
print(f"\nBest model '{best_model_name}' saved to stroke_model.pkl")

