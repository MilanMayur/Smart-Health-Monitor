//internal/tips/service.go
package tips

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"strconv"
)

type TipsService struct {
	Collection *mongo.Collection
}

func NewTipsService(db *mongo.Database) *TipsService {
	return &TipsService{
		Collection: db.Collection("healthtips"),
	}
}

func (s *TipsService) GetTipsByCategory(ctx context.Context, category, level string) (TipLevel, error) {
	var doc TipDoc
	err := s.Collection.FindOne(ctx, bson.M{"category": category}).Decode(&doc)
	if err != nil {
		return getDefaultTip(), nil 
	}
	if tips, ok := doc.Tips[level]; ok {
		return tips, nil
	}
	return getDefaultTip(), nil
}

func (s *TipsService) GetSuggestedTips(ctx context.Context, metrics map[string]any) (map[string]TipLevel, error) {
	out := make(map[string]TipLevel)

	var tipCategories = []string{
		"bmi", "glucose", "bloodPressure", 
		"insulin", "cholesterol", "maxHeartRate",
	}

	for _, category := range tipCategories {
		level := getLevel(category, metrics[category])
		tips, _ := s.GetTipsByCategory(ctx, category, level)
		out[category] = tips
	}
	return out, nil
}

func getLevel(metric string, value any) string {
	// Convert numeric or string to float64
	numeric := func(val any) float64 {
		switch v := val.(type) {
		case float64:
			return v
		case int:
			return float64(v)
		case string:
			f, _ := strconv.ParseFloat(v, 64)
			return f
		}
		return 0
	}

	if value == nil || value == "N/A" {
		return "none"
	}

	v := numeric(value)

	switch metric {
	case "bmi":
		switch {
		case v >= 30:
			return "high"
		case v >= 25:
			return "moderate"
		case v >= 18.5:
			return "moderate" 
		default:
			return "low"
		}
	case "maxHeartRate":
		switch {
		case v >= 180:
			return "high"
		case v > 100 && v < 180:
			return "moderate" 
		case v >= 60 && v <= 100:
			return "moderate"
		default:
			return "low" 
		}
	case "glucose":
		switch {
		case v >= 126:
			return "high"
		case v >= 100:
			return "moderate"
		case v >= 70:
			return "moderate"
		default:
			return "low"
		}
	case "bloodPressure":
		switch {
		case v >= 140:
			return "high"
		case v >= 120:
			return "moderate"
		case v >= 90:
			return "moderate"
		default:
			return "low"
		}
	case "insulin":
		switch {
		case v >= 150:
			return "high"
		case v > 25:
			return "moderate"
		case v > 5:
			return "moderate"
		default:
			return "low"
		}
	case "cholesterol":
		switch {
		case v >= 240:
			return "high"
		case v >= 200:
			return "moderate"
		case v >= 125:
			return "moderate"
		default:
			return "low"
		}
	}
	return "moderate"
}

func getDefaultTip() TipLevel {
	return TipLevel{
		Tip1: "Maintain a healthy lifestyle.", 
		Tip2: "Drink sufficient water.",
	}
}
