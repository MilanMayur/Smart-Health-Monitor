// internal/auth/service.go
package auth

import (
	"context"
	"errors"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	UserCollection *mongo.Collection
}

func NewAuthService(db *mongo.Database) *AuthService {
	return &AuthService{
		UserCollection: db.Collection("users"),
	}
}

func (s *AuthService) Register(ctx context.Context, dto RegisterDTO) (*User, error) {
	// check if user exists
	var existing User
	err := s.UserCollection.FindOne(ctx, bson.M{"email": dto.Email}).Decode(&existing)
	if err == nil {
		return nil, errors.New("email already registered")
	}

	// hash password
	hashed, hashErr := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if hashErr != nil {
		return nil, hashErr
	}

	user := &User{
        FirstName: dto.FirstName,
        LastName:  dto.LastName,
        Email:     dto.Email,
        Password:  string(hashed),
        CreatedAt: time.Now(),
    }

	res, insertErr  := s.UserCollection.InsertOne(ctx, user)
	if insertErr != nil {
		return nil, insertErr
	}
	user.ID = res.InsertedID.(primitive.ObjectID)

	return user, nil
}

func (s *AuthService) Login(ctx context.Context, dto LoginDTO) (*User, error) {
	var user User
	err := s.UserCollection.FindOne(ctx, bson.M{"email": dto.Email}).Decode(&user)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(dto.Password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	return &user, nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID string, dto ChangePasswordDTO) error {
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		return errors.New("invalid user id")
	}

	var user User
	err = s.UserCollection.FindOne(ctx, bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		return errors.New("user not found")
	}

	// verify old password
	if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(dto.OldPassword)) != nil {
		return errors.New("wrong old password")
	}

	// update password
	hashed, hashErr := bcrypt.GenerateFromPassword([]byte(dto.NewPassword), bcrypt.DefaultCost)
	if hashErr != nil {
		return hashErr
	}

	_, updateErr := s.UserCollection.UpdateOne(ctx,
		bson.M{"_id": objID},
		bson.M{"$set": bson.M{"password": string(hashed), "updatedAt": time.Now()}},
	)
	return updateErr
}
