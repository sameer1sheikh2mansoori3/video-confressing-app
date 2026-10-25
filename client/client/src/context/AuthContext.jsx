import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [notification, setNotification] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    //   true loading per buttton disable kr do
    setLoading(true);
    const responseFromBackend = await api.post("/auth/signup", formData);
    if (responseFromBackend.data.statusCode === 200) {
      setNotification("User signUp successfully");
      setFormData(responseFromBackend.data.user);
      //   on succesful signup do routing
    } else if (responseFromBackend.data.statusCode === 401) {
      setNotification("Please Change Your UserName");
    } else {
      setNotification("SomeThing Went Wrong Please Try Again !!!");
    }
    setLoading(false);
  };

  const login = (userData = null) => {
    setUser(userData);
  };

  // Guest
  const guestLogin = () => {
    setUser({ name: "Guest", username: "guest", isGuest: true });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signup, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
