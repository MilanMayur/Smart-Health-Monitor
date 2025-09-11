//internal/fitness/model.go
package fitness

type FitnessDay struct {
	Condition   string `bson:"condition"   json:"condition"`
	Day         string `bson:"day"         json:"day"`
	Workout     string `bson:"workout"     json:"workout"`
	Description string `bson:"description" json:"description"`
	Duration    int    `bson:"duration"    json:"duration"` // in minutes
}

type FitnessPlan struct {
	Condition string       `bson:"condition" json:"condition"` // diabetes, heart, stroke
	Risk      string       `bson:"risk"      json:"risk"`           // high, medium, low
	Days      []FitnessDay `bson:"days"      json:"days"`
}
