// internal/nutrition/service.go
package nutrition

import (
	"context"
	"math/rand"
	"sort"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type NutritionService struct {
	Collection *mongo.Collection
}

func NewNutritionService(db *mongo.Database) *NutritionService {
	return &NutritionService{
		Collection: db.Collection("dietplans"),
	}
}

func (s *NutritionService) GetDietPlanByBmi(ctx context.Context, bmi float64) ([]*FlatDayPlan, error) {
	category := "low_bmi"
	switch {
	case bmi > 24.9:
		category = "high_bmi"
	case bmi >= 18.5:
		category = "normal_bmi"
	}

	// Fetch all day plans
	cursor, err := s.Collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Week order
	order := map[string]int{"Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3, 
							"Friday": 4, "Saturday": 5, "Sunday": 6}
	var plans []*FlatDayPlan

	for cursor.Next(ctx) {
		var dp DietPlan
		if err := cursor.Decode(&dp); err != nil {
			continue 
		}
		mealMap, ok := dp.Meal[category]
		if ok && mealMap != nil {
			normalizedMealMap := map[string]string{
				"Breakfast": mealMap["breakfast"],
				"Lunch":     mealMap["lunch"],
				"Dinner":    mealMap["dinner"],
			}
            plans = append(plans, &FlatDayPlan{
                Day:  dp.Day,
                Meal: normalizedMealMap, 
            })
        }
	}

	// Sort by weekday order
	sort.Slice(plans, func(i, j int) bool {
		return order[plans[i].Day] < order[plans[j].Day]
	})

	return plans, nil
}

func (s *NutritionService) CalculateCalories(bmi float64) int {
	switch {
	case bmi < 18.5:
		return 2500
	case bmi >= 18.5 && bmi <= 24.9:
		return 2000
	default:
		return 1700
	}
}

func (s *NutritionService) GetTips(metrics *NutritionMetrics) []string {
	heartTips := []string{
		"Avoid fried foods, excess red meat, and full-fat dairy.",
		"Limit sodium intake—choose fresh, whole foods over processed ones.",
		"Stay active with 30 minutes of daily moderate exercise.",
		"Quit smoking and reduce alcohol consumption.",
		"Check blood pressure and cholesterol regularly.",
	}

	diabetesTips := []string{
		"Avoid sugar-rich snacks, opt for complex carbs like oats and lentils.",
		"Maintain a healthy weight through balanced diet and exercise.",
		"Control portion sizes and avoid high-GI foods.",
		"Be physically active—aim for 150 minutes of activity per week.",
		"Get regular blood sugar check-ups and monitor symptoms.",
	}

	rand.Seed(time.Now().UnixNano())

	var tips []string
	if metrics.HeartRisk == "high" || metrics.HeartRisk == "moderate" {
		tips = append(tips, heartTips[rand.Intn(len(heartTips))])
	}
	if metrics.DiabetesRisk == "high" || metrics.DiabetesRisk == "moderate" {
		tips = append(tips, diabetesTips[rand.Intn(len(diabetesTips))])
	}
	if len(tips) == 0 {
		tips = append(tips, "Keep up your healthy lifestyle with regular exercise and a balanced diet.")
	}
	
	return tips
}
