import React, { useEffect, useState } from "react";
import { db } from './firebase.js';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';

function NotificationManager() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, read, unread

  // Lắng nghe notifications real-time từ Firebase
  const fetchNotifications = () => {
    try {
      console.log('Setting up real-time notifications listener for admin...');
      setLoading(true);
      
      const notificationsRef = collection(db, 'notifications');
      let q;
      
      if (filter === 'read') {
        q = query(notificationsRef, where('isRead', '==', true), orderBy('createdAt', 'desc'));
      } else if (filter === 'unread') {
        q = query(notificationsRef, where('isRead', '==', false), orderBy('createdAt', 'desc'));
      } else {
        q = query(notificationsRef, orderBy('createdAt', 'desc'));
      }
      
      // Sử dụng onSnapshot để lắng nghe real-time
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsData = [];
        querySnapshot.forEach((doc) => {
          notificationsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        console.log(`Received ${notificationsData.length} notifications from Firebase (real-time)`);
        setNotifications(notificationsData);
        setError(null);
        setLoading(false);
      }, (error) => {
        console.error('Error listening to notifications from Firebase:', error);
        setError('Không thể lắng nghe thông báo từ Firebase: ' + error.message);
        setLoading(false);
      });

      // Return unsubscribe function
      return unsubscribe;
      
    } catch (error) {
      console.error('Error setting up notifications listener:', error);
      setError('Không thể thiết lập lắng nghe thông báo: ' + error.message);
      setLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = fetchNotifications();
    
    // Cleanup listener when component unmounts or filter changes
    return () => {
      if (unsubscribe) {
        console.log('Cleaning up notifications listener');
        unsubscribe();
      }
    };
  }, [filter]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div>🔄 Đang tải thông báo từ Firebase...</div>
    </div>
  );
  
  if (error) return (
    <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
      <strong>Lỗi:</strong> {error}
      <br />
      <button 
        onClick={fetchNotifications}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Thử lại
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🔔 Quản lý Thông báo</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="all">Tất cả ({notifications.length})</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
          </select>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Tải lại
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            🔔 Không có thông báo nào
          </div>
          <p style={{ color: '#666' }}>
            {filter === 'unread' ? 'Không có thông báo chưa đọc' : 
             filter === 'read' ? 'Không có thông báo đã đọc' : 
             'Chưa có thông báo nào được gửi'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: notification.isRead ? '#f9f9f9' : '#fff',
                borderLeft: `4px solid ${
                  notification.type === 'order_update' ? '#28a745' : '#007bff'
                }`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, color: '#333' }}>
                  {notification.title}
                  {!notification.isRead && (
                    <span style={{
                      marginLeft: '8px',
                      padding: '2px 6px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      borderRadius: '10px',
                      fontSize: '10px'
                    }}>
                      MỚI
                    </span>
                  )}
                </h3>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  whiteSpace: 'nowrap'
                }}>
                  {notification.createdAt?.toDate ? 
                    notification.createdAt.toDate().toLocaleString() : 
                    'Vừa xong'
                  }
                </span>
              </div>
              
              <p style={{ margin: '10px 0', color: '#555' }}>
                {notification.message}
              </p>
              
              <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#666' }}>
                <span><strong>User ID:</strong> {notification.userId}</span>
                <span><strong>Đơn hàng:</strong> #{notification.orderId}</span>
                <span><strong>Trạng thái:</strong> 
                  <span style={{
                    marginLeft: '4px',
                    padding: '2px 6px',
                    backgroundColor: notification.status === 'confirmed' ? '#28a745' : '#6c757d',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '10px'
                  }}>
                    {notification.status}
                  </span>
                </span>
                <span><strong>Loại:</strong> {notification.type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationManager;
