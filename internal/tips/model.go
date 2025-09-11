//internal/tips/model.go
package tips

type TipLevel struct {
	Tip1 string `bson:"tip1" json:"tip1"`
	Tip2 string `bson:"tip2" json:"tip2"`
	Tip3 string `bson:"tip3" json:"tip3"`
	Tip4 string `bson:"tip4" json:"tip4"`
	Tip5 string `bson:"tip5" json:"tip5"`
}

type TipDoc struct {
	Category string                `bson:"category" json:"category"`
	Tips     map[string]TipLevel   `bson:"tips"     json:"tips"`
}

type Insight struct {
	Label         string      `json:"label"         bson:"label"`
	Value         interface{} `json:"value"         bson:"value"`
	Unit          string      `json:"unit"          bson:"unit"`
	LevelLabel    string      `json:"levelLabel"    bson:"levelLabel"`
	ColorClass    string      `json:"colorClass"    bson:"colorClass"`
	GradientClass string      `json:"gradientClass" bson:"gradientClass"`
	Tips        []string      `json:"tips"          bson:"tips"`
}
