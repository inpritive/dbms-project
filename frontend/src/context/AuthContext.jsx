import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    // #region agent log
    fetch('http://127.0.0.1:7626/ingest/5a4d8a78-6288-47ee-a76c-e2b42b361e83',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e2cb1'},body:JSON.stringify({sessionId:'4e2cb1',location:'AuthContext.jsx:login',message:'Login request start',data:{apiUrl},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      const { data } = await api.post('/auth/login', { username: username.trim(), password });
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
      return data;
    } catch (err) {
      // #region agent log
      fetch('http://127.0.0.1:7626/ingest/5a4d8a78-6288-47ee-a76c-e2b42b361e83',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'4e2cb1'},body:JSON.stringify({sessionId:'4e2cb1',location:'AuthContext.jsx:login',message:'Login request failed',data:{status:err.response?.status,message:err.response?.data?.message,networkError:!err.response},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
