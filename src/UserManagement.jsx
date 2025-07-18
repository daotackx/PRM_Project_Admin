import React, { useState, useEffect } from 'react';
import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    avatar: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from Firebase...');
      setLoading(true);
      
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`Found ${usersData.length} users from Firebase`);
      setUsers(usersData);
      setError('');
    } catch (error) {
      console.error('Error fetching users from Firebase:', error);
      setError('Không thể tải danh sách users từ Firebase: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      console.log('Adding user to Firebase:', newUser);
      
      // Thêm user vào Firebase Firestore
      const usersRef = collection(db, 'users');
      await addDoc(usersRef, {
        ...newUser,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      console.log('User added successfully');
      setNewUser({ fullName: '', email: '', phone: '', password: '', address: '', avatar: '' });
      setShowAddForm(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Không thể thêm user: ' + error.message);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      console.log(`Updating user ${userId}:`, updates);
      
      // Cập nhật user trong Firebase Firestore
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Date.now()
      });

      console.log('User updated successfully');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Không thể cập nhật user: ' + error.message);
    }
  };
  if (loading) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div>🔄 Đang tải users từ Firebase...</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 Quản lý Users BookStore</h2>
        <div>
          <button
            onClick={fetchUsers}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            🔄 Tải lại ({users.length})
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showAddForm ? '❌ Hủy' : '➕ Thêm User'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ffebee',
          color: '#c62828',
          padding: '10px',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3>Thêm User Mới</h3>
          <form onSubmit={handleAddUser}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <input
                type="text"
                placeholder="Họ và tên"
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={newUser.phone}
                onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                required
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px'
                }}
              />
              <input
                type="text"
                placeholder="Địa chỉ"
                value={newUser.address}
                onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  gridColumn: 'span 2'
                }}
              />
              <input
                type="url"
                placeholder="URL Avatar (tùy chọn)"
                value={newUser.avatar}
                onChange={(e) => setNewUser({...newUser, avatar: e.target.value})}
                style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  gridColumn: 'span 2'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Thêm User
            </button>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Avatar</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Tên</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Email</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Số điện thoại</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Địa chỉ</th>
              <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #dee2e6' }}>Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id || user.email} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }} 
                    />
                  ) : (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      {user.fullName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  )}
                </td>
                <td style={{ padding: '15px' }}>{user.fullName || 'N/A'}</td>
                <td style={{ padding: '15px' }}>{user.email}</td>
                <td style={{ padding: '15px' }}>{user.phone || 'N/A'}</td>
                <td style={{ padding: '15px' }}>{user.address || 'N/A'}</td>
                <td style={{ padding: '15px' }}>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
