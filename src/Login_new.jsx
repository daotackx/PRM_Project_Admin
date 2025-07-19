import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sử dụng Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Lấy thông tin user từ Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const user = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: userData.fullName || userData.name || firebaseUser.displayName || 'Admin',
          role: userData.role || 'admin',
          avatar: userData.avatar || '👨‍💼',
          loginTime: Date.now()
        };

        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);
      } else {
        // Nếu không có document trong Firestore, tạo user mặc định
        const defaultUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName || 'Admin',
          role: 'admin',
          avatar: '👨‍💼',
          loginTime: Date.now()
        };

        localStorage.setItem('user', JSON.stringify(defaultUser));
        onLogin(defaultUser);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Firebase error messages
      switch (error.code) {
        case 'auth/invalid-email':
          setError('Email không hợp lệ');
          break;
        case 'auth/user-disabled':
          setError('Tài khoản đã bị vô hiệu hóa');
          break;
        case 'auth/user-not-found':
          setError('Tài khoản không tồn tại');
          break;
        case 'auth/wrong-password':
          setError('Mật khẩu không đúng');
          break;
        case 'auth/too-many-requests':
          setError('Quá nhiều lần thử. Vui lòng thử lại sau');
          break;
        case 'auth/network-request-failed':
          setError('Lỗi kết nối mạng. Vui lòng kiểm tra internet');
          break;
        case 'auth/invalid-credential':
          setError('Email hoặc mật khẩu không đúng');
          break;
        default:
          setError('Đăng nhập thất bại: ' + error.message);
      }
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
          <h1 style={{ color: '#333', marginBottom: '10px' }}>📚 BookStore Admin</h1>
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
          <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🔥 Firebase Authentication</h4>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div style={{ marginBottom: '5px' }}>
              🔑 Sử dụng Firebase Authentication thật
            </div>
            <div style={{ marginBottom: '5px' }}>
              📧 Tài khoản phải được tạo trong Firebase Console
            </div>
            <div style={{ marginBottom: '5px' }}>
              🗃️ Thông tin user sẽ được lấy từ Firestore collection 'users'
            </div>
            <div>
              👥 Role được xác định từ document trong Firestore
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
