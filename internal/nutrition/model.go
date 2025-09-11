//internal/nutrition/model.go
package nutrition

type DietPlan struct {
    Day         string                `bson:"day"  json:"day"`
    Meal map[string]map[string]string `bson:"meal" json:"meal"` // Breakfast, Lunch, Dinner
}

type FlatDayPlan struct {
	Day   string             `bson:"day"  json:"day"`
	Meal  map[string]string  `bson:"meal" json:"meal"` // [breakfast, lunch, dinner]
}

type NutritionMetrics struct {
	BMI          float64 `bson:"bmi"          json:"bmi"`
	HeartRisk    string  `bson:"heartRisk"    json:"heartRisk"`
	DiabetesRisk string  `bson:"diabetesRisk" json:"diabetesRisk"`
}
