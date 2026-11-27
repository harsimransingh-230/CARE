// import { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import api from '../api';
// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;
//     api.get('/auth/me')
//       .then(({ data }) => { if (mounted) setUser(data.user); })
//       .catch(() => { if (mounted) setUser(null); })
//       .finally(() => { if (mounted) setLoading(false); });
//     return () => { mounted = false; };
//   }, []);

//   const value = useMemo(() => ({
//     user,
//     loading,
//     async login(payload) {
//       const { data } = await api.post('/auth/login', payload);
//       setUser(data.user);
//       return data.user;
//     },
//     async register(payload) {
//       const { data } = await api.post('/auth/register', payload);
//       setUser(data.user);
//       return data;
//     },
//     async logout() {
//       await api.post('/auth/logout');
//       setUser(null);
//     }
//   }), [user, loading]);

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// }


import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user is already logged in
  useEffect(() => {
    let mounted = true;

    const checkUser = async () => {
      try {
        const { data } = await api.get("/auth/me");

        if (mounted) {
          setUser(data.user);
        }
      } catch (error) {
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Authentication functions
  const value = useMemo(
    () => ({
      user,
      loading,

      async login(payload) {
        const { data } = await api.post("/auth/login", payload);
        setUser(data.user);
        return data.user;
      },

      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        setUser(data.user);
        return data;
      },

      async logout() {
        try {
          await api.post("/auth/logout");
        } finally {
          setUser(null);
        }
      }
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom authentication hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
