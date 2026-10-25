import React, { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
const AuthContext = createContext(null);
import { Backend_url } from "../../url";

export function AuthProvider({ children }) {
    
   const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [notification , setNotification] = ("");
  const [loading , setLoading] = useState(false);

  const signUp = async()=>{
     //   true loading per buttton disable kr do
        setLoading(1);
      const responseFromBackend =  await axios.post( `${Backend_url}/api/auth/signup` , data);
      if(responseFromBackend.data.statusCode === 200){
          setNotification("User signUp successfully")
          setFormData(responseFromBackend.data.user); 
        //   on succesful signup do routing 
      }else if(responseFromBackend.data.statusCode === 401){
          setNotification("Please Change Your UserName");
      }else{
        setNotification("SomeThing Went Wrong Please Try Again !!!")
      }
       setLoading(0);
  }
  
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