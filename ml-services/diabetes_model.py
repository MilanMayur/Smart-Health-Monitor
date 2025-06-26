#diabetes_model.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, StackingClassifier
from sklearn.impute import SimpleImputer
from xgboost import XGBClassifier
from sklearn.svm import SVC
import matplotlib.pyplot as plt
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
from sklearn.metrics import roc_curve, auc
import os
import joblib
import warnings

warnings.filterwarnings("ignore")
os.makedirs('charts', exist_ok=True)

# Load dataset
diabetes = pd.read_csv('../dataset/diabetes.csv')

# Rename headers
diabetes.rename(columns={
    'Pregnancies': 'pregnancies',
    'Glucose': 'glucose',
    'BloodPressure': 'bloodPressure',
    'SkinThickness': 'skinThickness',
    'Insulin': 'insulin',
    'BMI': 'bmi',
    'DiabetesPedigreeFunction': 'diabetesPedigreeFunction',
    'Age': 'age',
    'Outcome': 'target'
}, inplace=True)

# Replace invalid zeros with NaN
features_with_invalid_zeros = ['glucose', 'bloodPressure', 'skinThickness', 'insulin', 'bmi']
diabetes[features_with_invalid_zeros] = diabetes[features_with_invalid_zeros].replace(0, np.nan)

#---------------------------
# Cap outliers (preserves all rows, but limits extreme influence)
diabetes['insulin'] = diabetes['insulin'].clip(lower=2, upper=300)

# Fill the NaNs with those random values
num_missing = diabetes['insulin'].isna().sum()
random_insulin = np.round(np.random.uniform(2, 200, size=num_missing), 1)
diabetes.loc[diabetes['insulin'].isna(), 'insulin'] = random_insulin

#---------------------------
X = diabetes.drop('target', axis=1)
y = diabetes['target']

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
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
        "model": RandomForestClassifier(class_weight='balanced'),
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
        "model": SVC(probability=True, class_weight='balanced'),
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
    pipe = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler()),
        ('model', cfg['model'])
    ])

    grid = GridSearchCV(pipe, cfg['params'], 
                        cv=5, scoring='roc_auc', #scoring='accuracy'
                        n_jobs=1, error_score='raise') #1
    
    grid.fit(X_train, y_train)

    best_models[name] = grid
    y_pred = grid.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    test_accuracies[name] = acc

    print(f"Best Parameters for {name}: {grid.best_params_}")
    print(f"Validation Accuracy: {grid.best_score_:.4f}")
    
# Evaluate on test set
print("\n--- Test Set Evaluation ---")
for name, model in best_models.items():
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n{name} Test Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred))

# Charts
for name, model in best_models.items():
    # Confusion matrix
    y_pred = model.predict(X_test)
    cm = confusion_matrix(y_test, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm)
    disp.plot(cmap='Blues')
    plt.title(f'Confusion Matrix: {name}')
    plt.savefig(f'charts/confusion_matrix_{name.replace(" ", "_")}.png')
    plt.close()

    # Histogram
    proba = model.predict_proba(X_test)[:, 1]
    plt.figure(figsize=(6,4))
    plt.hist(proba, bins=20, color='orange', edgecolor='k')
    plt.title(f'Probability Histogram: {name}')
    plt.xlabel('Predicted Probability of Diabetes')
    plt.ylabel('Number of Samples')
    plt.tight_layout()
    plt.savefig(f'charts/probability_histogram_{name.replace(" ", "_")}.png')
    plt.close()

    # ROC curve
    fpr, tpr, _ = roc_curve(y_test, proba)
    roc_auc = auc(fpr, tpr)
    plt.figure()
    plt.plot(fpr, tpr, label=f'AUC = {roc_auc:.2f}')
    plt.plot([0, 1], [0, 1], 'k--')
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title(f'ROC Curve: {name}')
    plt.legend(loc='lower right')
    plt.tight_layout()
    plt.savefig(f'charts/roc_curve_{name.replace(" ", "_")}.png')
    plt.close()

# Ranking by Test Accuracy
print("\nModel Ranking by Test Accuracy:")
for rank, (name, acc) in enumerate(sorted(test_accuracies.items(), key=lambda x: x[1], reverse=True), 1):
    print(f"{rank}. {name} - Test Accuracy: {acc:.4f}")

# Save best model
best_model_name = max(test_accuracies, key=test_accuracies.get)
joblib.dump(best_models[best_model_name], 'model/diabetes_model.pkl')
print(f"\nBest model '{best_model_name}' saved to diabetes_model.pkl")



# Probability histogram
probs = best_models[best_model_name].predict_proba(X_test)[:, 1]
plt.hist(probs, bins=20)
plt.title('Predicted Stroke Risk Probabilities')
plt.xlabel('Probability')
plt.ylabel('Number of Samples')
plt.savefig('charts/diabetes_histogram.png')
plt.show()
plt.close()

# Confusion matrix
y_pred = best_models[best_model_name].predict(X_test)
cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm)
disp.plot()
plt.title('Confusion Matrix')
plt.savefig('charts/diabetes_cfn_matrix.png')
plt.show()
plt.close()
