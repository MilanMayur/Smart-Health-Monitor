//internal/metrics/model.go
package metrics

import "time"

type Metric struct {
    UserID              string    `bson:"userId"                             json:"userId"`
    Age                 int       `bson:"age,omitempty"                      json:"age,omitempty"`
    Sex                 int       `bson:"sex,omitempty"                      json:"sex,omitempty"`
    BloodPressure       float64   `bson:"bloodPressure,omitempty"            json:"bloodPressure,omitempty"`
    Insulin             float64   `bson:"insulin,omitempty"                  json:"insulin,omitempty"`
    BMI                 float64   `bson:"bmi,omitempty"                      json:"bmi,omitempty"`
    Glucose             float64   `bson:"glucose,omitempty"                  json:"glucose,omitempty"`
    Cholesterol         float64   `bson:"cholesterol,omitempty"              json:"cholesterol,omitempty"`
    SkinThickness       float64   `bson:"skinThickness,omitempty"            json:"skinThickness,omitempty"`
    DiabetesPedigree    float64   `bson:"diabetesPedigreeFunction,omitempty" json:"diabetesPedigreeFunction,omitempty"`
    Pregnancies         int       `bson:"pregnancies,omitempty"              json:"pregnancies,omitempty"`
    SmokingStatus       string    `bson:"smokingStatus,omitempty"            json:"smokingStatus,omitempty"`
    WorkType            string    `bson:"workType,omitempty"                 json:"workType,omitempty"`
    ResidenceType       string    `bson:"residenceType,omitempty"            json:"residenceType,omitempty"`
    Hypertension        int       `bson:"hypertension,omitempty"             json:"hypertension,omitempty"`
    HeartDisease        int       `bson:"heartDisease,omitempty"             json:"heartDisease,omitempty"`
    ChestPainType       int       `bson:"chestPainType,omitempty"            json:"chestPainType,omitempty"`
    RestingECG          int       `bson:"restingECG,omitempty"               json:"restingECG,omitempty"`
    MaxHeartRate        float64   `bson:"maxHeartRate,omitempty"             json:"maxHeartRate,omitempty"`
    ExerciseInducedAng  int       `bson:"exerciseInducedAngina,omitempty"    json:"exerciseInducedAngina,omitempty"`
    Oldpeak             float64   `bson:"oldpeak,omitempty"                  json:"oldpeak,omitempty"`
    STSegment           int       `bson:"stSegment,omitempty"                json:"stSegment,omitempty"`
    MajorVessels        int       `bson:"majorVessels,omitempty"             json:"majorVessels,omitempty"`
    Thalassemia         int       `bson:"thalassemia,omitempty"              json:"thalassemia,omitempty"`

    // Prediction fields
    DiabetesPrediction   string    `bson:"diabetesPrediction,omitempty"      json:"diabetesPrediction,omitempty"`
    DiabetesProbability  float64   `bson:"diabetesProbability,omitempty"     json:"diabetesProbability,omitempty"`
    DiabetesRiskCategory string    `bson:"diabetesRiskCategory,omitempty"    json:"diabetesRiskCategory,omitempty"`

    HeartPrediction      string    `bson:"heartPrediction,omitempty"         json:"heartPrediction,omitempty"`
    HeartProbability     float64   `bson:"heartProbability,omitempty"        json:"heartProbability,omitempty"`
    HeartRiskCategory    string    `bson:"heartRiskCategory,omitempty"       json:"heartRiskCategory,omitempty"`

    StrokePrediction     string    `bson:"strokePrediction,omitempty"        json:"strokePrediction,omitempty"`
    StrokeProbability    float64   `bson:"strokeProbability,omitempty"       json:"strokeProbability,omitempty"`
    StrokeRiskCategory   string    `bson:"strokeRiskCategory,omitempty"      json:"strokeRiskCategory,omitempty"`

    UpdatedAt            time.Time `bson:"updatedAt,omitempty"               json:"updatedAt,omitempty"` 
}
