// internal/pages/model.go
package pages

type Vital struct {
    Title string
    Value string
    Color string
}

type Risk struct {
    Title string
    Value string
	Probability int
    Color string
}

type RiskChartEntry struct {
    Name  string
    Value int
    Color string
}
