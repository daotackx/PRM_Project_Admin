import React, { useEffect, useState } from "react";
import { db } from './firebase.js';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

function UserNotifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    console.log('Setting up real-time notifications listener for user:', userId);

    // Tạo query để lắng nghe thông báo real-time
    // Chỉ sử dụng where clause để tránh cần composite index
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', userId)
    );

    // Lắng nghe thay đổi real-time
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      try {
        const notificationsData = [];
        let unreadCounter = 0;

        querySnapshot.forEach((doc) => {
          const notification = {
            id: doc.id,
            ...doc.data()
          };
          notificationsData.push(notification);
          
          if (!notification.isRead) {
            unreadCounter++;
          }
        });

        // Sắp xếp theo thời gian tạo (mới nhất trước)
        notificationsData.sort((a, b) => {
          const timeA = a.createdAt || 0;
          const timeB = b.createdAt || 0;
          return timeB - timeA;
        });

        console.log(`Received ${notificationsData.length} notifications for user ${userId}`);
        setNotifications(notificationsData);
        setUnreadCount(unreadCounter);
        setError(null);
        setLoading(false);

        // Hiển thị thông báo mới nếu có
        const newNotifications = notificationsData.filter(n => 
          !n.isRead && n.type === 'order_confirmed'
        );
        
        if (newNotifications.length > 0) {
          newNotifications.forEach(notification => {
            showNotificationPopup(notification);
          });
        }

      } catch (error) {
        console.error('Error processing notifications:', error);
        setError('Lỗi khi xử lý thông báo: ' + error.message);
        setLoading(false);
      }
    }, (error) => {
      console.error('Error listening to notifications:', error);
      setError('Lỗi khi lắng nghe thông báo: ' + error.message);
      setLoading(false);
    });

    // Cleanup function
    return () => {
      console.log('Cleaning up notifications listener');
      unsubscribe();
    };
  }, [userId]);

  // Hiển thị popup thông báo
  const showNotificationPopup = (notification) => {
    // Sử dụng browser notification nếu được phép
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }

    // Hoặc hiển thị toast notification tùy chỉnh
    console.log('🔔 New order notification:', notification.message);
  };

  // Đánh dấu thông báo đã đọc
  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: new Date()
      });
      console.log('Notification marked as read:', notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Đánh dấu tất cả đã đọc
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const promises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), {
          isRead: true,
          readAt: new Date()
        })
      );
      await Promise.all(promises);
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  if (!userId) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Vui lòng đăng nhập để xem thông báo</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>🔄 Đang tải thông báo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: 'red', 
        backgroundColor: '#ffe6e6', 
        borderRadius: '5px',
        margin: '10px'
      }}>
        <strong>Lỗi:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h3>
          🔔 Thông báo 
          {unreadCount > 0 && (
            <span style={{
              marginLeft: '8px',
              padding: '2px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '12px',
              fontSize: '12px'
            }}>
              {unreadCount}
            </span>
          )}
        </h3>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            📬 Chưa có thông báo nào
          </div>
          <p style={{ color: '#666', margin: 0 }}>
            Thông báo về đơn hàng của bạn sẽ hiển thị ở đây
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              style={{
                padding: '16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: notification.isRead ? '#f8f9fa' : '#fff',
                borderLeft: `4px solid ${
                  notification.type === 'order_confirmed' ? '#28a745' : '#007bff'
                }`,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => !notification.isRead && markAsRead(notification.id)}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start',
                marginBottom: '8px'
              }}>
                <h4 style={{ 
                  margin: 0, 
                  color: '#333',
                  fontSize: '16px'
                }}>
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
                </h4>
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
              
              <p style={{ 
                margin: '8px 0', 
                color: '#555',
                lineHeight: '1.4'
              }}>
                {notification.message}
              </p>
              
              {notification.orderDetails && (
                <div style={{ 
                  marginTop: '12px',
                  padding: '8px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  <div><strong>Mã đơn hàng:</strong> #{notification.orderDetails.orderId}</div>
                  <div><strong>Tổng tiền:</strong> {notification.orderDetails.total?.toLocaleString() || 0}đ</div>
                  {notification.orderDetails.items?.length > 0 && (
                    <div><strong>Số sản phẩm:</strong> {notification.orderDetails.items.length}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserNotifications;
