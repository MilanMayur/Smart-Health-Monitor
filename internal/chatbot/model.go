// internal/chatbot/model.go
package chatbot

import "go.mongodb.org/mongo-driver/bson/primitive"

type ChatRequest struct {
	UserID  string `json:"userId"`
	Message string `json:"message"`
}

type User struct {
	ID         primitive.ObjectID `bson:"_id"`
	FirstName  string             `bson:"firstName"`
	LastName   string             `bson:"lastName"`
	Email      string             `bson:"email"`
}
