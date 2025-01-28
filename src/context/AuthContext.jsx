// frontend/src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Attempt to load from localStorage if present
    const saved = localStorage.getItem("myapp-user");
    return saved ? JSON.parse(saved) : null;
  });

  // Whenever user changes, save to localStorage
  useEffect(() => {
    if (user) localStorage.setItem("myapp-user", JSON.stringify(user));
    else localStorage.removeItem("myapp-user");
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
