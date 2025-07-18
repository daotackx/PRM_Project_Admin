import React, { useState } from 'react';
// import { mockLogin } from './mockAuth'; // Uncomment để sử dụng mock auth

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useMockAuth, setUseMockAuth] = useState(false); // Toggle để chọn mock auth

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (useMockAuth) {
        // Sử dụng mock authentication
        const { mockLogin } = await import('./mockAuth');
        const result = await mockLogin(email, password);
        localStorage.setItem('user', JSON.stringify(result.user));
        onLogin(result.user);
      } else {
        // Sử dụng real API
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          // Lưu thông tin user vào localStorage
          localStorage.setItem('user', JSON.stringify(data.user));
          onLogin(data.user);
        } else {
          setError(data.error || 'Đăng nhập thất bại');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(useMockAuth ? error.message : 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#333', marginBottom: '10px' }}>🐾 PetShop Admin</h1>
          <p style={{ color: '#666', margin: 0 }}>Đăng nhập vào hệ thống quản lý</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập email của bạn"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              fontWeight: 'bold',
              color: '#333'
            }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
              placeholder="Nhập mật khẩu"
            />
          </div>

          {/* Toggle Mock Auth */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <input
                type="checkbox"
                checked={useMockAuth}
                onChange={(e) => setUseMockAuth(e.target.checked)}
              />
              Sử dụng Mock Authentication (Demo)
            </label>
          </div>

          {useMockAuth && (
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '12px',
              borderRadius: '5px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <strong>Tài khoản demo:</strong><br/>
              • admin@petshop.com / admin123 (Admin)<br/>
              • manager@petshop.com / manager123 (Manager)<br/>
              • user@petshop.com / user123 (User)
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.3s'
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '5px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Hướng dẫn đăng nhập:</h4>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div style={{ marginBottom: '5px' }}>
              📧 Sử dụng email và password đã được tạo trong Firebase
            </div>
            <div style={{ marginBottom: '5px' }}>
              🔑 Đăng nhập với tài khoản admin để quản lý hệ thống
            </div>
            <div>
              👥 Các role: admin, manager, user
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
