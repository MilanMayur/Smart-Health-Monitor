// internal/auth/middleware.go
package auth

import (
	"net/http"

	"github.com/gorilla/sessions"
)

func RequireAuth(store *sessions.CookieStore, next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        session, err := GetSession(r) 
        if err != nil {
            http.Error(w, "failed to get session", http.StatusInternalServerError)
            return
        }

        userID, ok := session.Values["user_id"].(string)
        if !ok || userID == "" {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`
				<!DOCTYPE html>
				<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta http-equiv="refresh" content="3;url=/login">
					<title>Please Login</title>
					<style>
						body { display:flex; justify-content:center; align-items:center; height:100vh; font-family:sans-serif; background:#f9fafb; }
						.box { text-align:center; padding:20px; border:1px solid #ddd; border-radius:8px; background:white; box-shadow:0 2px 6px rgba(0,0,0,0.1); }
					</style>
				</head>
				<body>
					<div class="box">
						<h2>Please login</h2>
						<p>You will be redirected to the login page in 3 seconds...</p>
						<p><a href="/login">Click here if not redirected</a></p>
					</div>
				</body>
				</html>
			`))
            return
        }

        // Attach userID to context
        ctx := WithUserID(r.Context(), userID)
        r = r.WithContext(ctx)

        next.ServeHTTP(w, r)
    })
}
