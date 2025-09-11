// internal/auth/model.go
package auth

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
    ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    FirstName string             `bson:"firstName" json:"firstName" validate:"required"`
    LastName  string             `bson:"lastName" json:"lastName" validate:"required"`
    Email     string             `bson:"email" json:"email" validate:"required"`
    Password  string             `bson:"password" json:"-" validate:"required,min=6"`
    CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
}

type RegisterDTO struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"firstName" validate:"required"`
    LastName  string `json:"lastName" validate:"required"`
}

type LoginDTO struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type ChangePasswordDTO struct {
	OldPassword string `json:"oldPassword" validate:"required"`
	NewPassword string `json:"newPassword" validate:"required,min=6"`
}
