import React, { useState } from 'react';
import UserNotifications from './UserNotifications';

function NotificationDemo() {
  const [userId, setUserId] = useState('');
  const [testUserId, setTestUserId] = useState('user123'); // Test user ID

  const handleUserIdChange = (e) => {
    setUserId(e.target.value);
  };

  const useTestUser = () => {
    setUserId(testUserId);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2>🔔 Demo Hệ thống Thông báo Real-time</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{
            display: 'block',
            marginBottom: '5px',
            fontWeight: 'bold'
          }}>
            Nhập User ID để xem thông báo:
          </label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={userId}
              onChange={handleUserIdChange}
              placeholder="Nhập User ID (ví dụ: user123)"
              style={{
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                minWidth: '200px'
              }}
            />
            <button
              onClick={useTestUser}
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Dùng Test User
            </button>
          </div>
        </div>

        <div style={{
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          <strong>🚀 Hướng dẫn test:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Nhập User ID hoặc dùng "user123" để test</li>
            <li>Vào tab "Quản lý Đơn hàng" trong Admin</li>
            <li>Tìm đơn hàng có userId trùng với User ID đã nhập</li>
            <li>Bấm "Xác nhận giao hàng" để tạo thông báo</li>
            <li>Thông báo sẽ xuất hiện real-time ở đây!</li>
          </ul>
        </div>

        {userId && (
          <div style={{
            marginTop: '10px',
            padding: '8px 12px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            ✅ Đang lắng nghe thông báo real-time cho User ID: <strong>{userId}</strong>
          </div>
        )}
      </div>

      {/* Component hiển thị thông báo */}
      <UserNotifications userId={userId} />
    </div>
  );
}

export default NotificationDemo;
