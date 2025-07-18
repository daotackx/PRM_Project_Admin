import { useState, useEffect } from 'react'
import './App.css'
import Login from './Login'
import Dashboard from './Dashboard'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        // Check if login is still valid (24 hours)
        const loginTime = userData.loginTime;
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        if (now - loginTime < oneDay) {
          setUser(userData);
        } else {
          localStorage.removeItem('user');
        }
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Đang tải...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App
