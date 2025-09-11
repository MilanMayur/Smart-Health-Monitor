//internal/health/model.go
package health

type PredictionResponse struct {
    Probability  float64 `json:"probability"`
    Prediction   string  `json:"prediction"`
    RiskCategory string  `json:"riskCategory"`
}
