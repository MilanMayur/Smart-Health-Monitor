// internal/auth/session.go
package auth

import (
	"errors"
	"net/http"

	"github.com/gorilla/sessions"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var store *sessions.CookieStore

func InitSessionStore(secret string) {
	store = sessions.NewCookieStore([]byte(secret))
	store.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7, // 7 days
		HttpOnly: true,
	}
}

func GetSession(r *http.Request) (*sessions.Session, error) {
	return store.Get(r, "smart-health-session")
}

func GetSessionStore() *sessions.CookieStore {
    return store
}

func GetUserIDFromSession(r *http.Request) (primitive.ObjectID, error) {
    session, err := GetSession(r)
	if err != nil {
		return primitive.NilObjectID, err
	}
	userIDStr, ok := session.Values["user_id"].(string)
	if !ok || userIDStr == "" {
		return primitive.NilObjectID, errors.New("userId not found in session")
	}
	userID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return primitive.NilObjectID, err
	}
	return userID, nil
}
