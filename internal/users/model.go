//internal/users/model.go
package users

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password,omitempty" json:"-"` // never expose
	FirstName string             `bson:"firstName" json:"firstName"`
	LastName  string             `bson:"lastName" json:"lastName"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type HealthBadge struct {
    Label string
    Color string
    Emoji string
}

type UpdateUser struct {
	FirstName  string `json:"firstName,omitempty"`
	LastName  string  `json:"lastName,omitempty"`
	Email string      `json:"email,omitempty"`
}
