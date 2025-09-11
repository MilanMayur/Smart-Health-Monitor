// internal/users/service.go
package users

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserService struct {
	UserCollection *mongo.Collection
}

func NewUserService(db *mongo.Database) *UserService {
	return &UserService{
		UserCollection: db.Collection("users"),
	}
}

func (s *UserService) GetByID(ctx context.Context, userId string) (*User, error) {
	objID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	var user User
	err = s.UserCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	return &user, nil
}

func (s *UserService) Update(ctx context.Context, userId string, dto UpdateUser) (*User, error) {
	objID, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, errors.New("invalid user id")
	}

	update := bson.M{
		"$set": bson.M{
			"firstName": dto.FirstName,
			"lastName":  dto.LastName,
			"email":     dto.Email,
			"updatedAt": time.Now(),
		},
	}

	_, err = s.UserCollection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	if err != nil {
		return nil, err
	}

	return s.GetByID(ctx, userId)
}

func (s *UserService) UpdatePassword(ctx context.Context, userID string, newHashed string) error {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return err
	}

	_, err = s.UserCollection.UpdateByID(ctx, objID, bson.M{
		"$set": bson.M{"password": newHashed},
	})
	
	return err
}
