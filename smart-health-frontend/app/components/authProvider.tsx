//components/authProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: any;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export function useAuth() {
    return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('http://localhost:3001/auth/check', {
                    credentials: 'include',
                });
                if (!res.ok) throw new Error('Not authenticated');
                const data = await res.json();
                setUser(data.user || null);
            } 
            catch {
                setUser(null);
            } 
            finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
