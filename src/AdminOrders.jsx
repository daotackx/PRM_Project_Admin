import React, { useEffect, useState } from "react";
import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc, orderBy, query } from 'firebase/firestore';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Lấy orders từ Firebase
  const fetchOrders = async () => {
    try {
      console.log('Fetching orders from Firebase...');
      setLoading(true);
      
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const ordersData = [];
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`Found ${ordersData.length} orders from Firebase`);
      setOrders(ordersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders from Firebase:', error);
      setError('Không thể tải đơn hàng từ Firebase: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      
      // Cập nhật trực tiếp trong Firebase
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: Date.now()
      });

      // Cập nhật state local
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus, updatedAt: Date.now() } : order
      ));
      
      console.log(`Order ${orderId} updated successfully`);
      setUpdating(null);
    } catch (error) {
      console.error('Error updating order in Firebase:', error);
      setError('Không thể cập nhật đơn hàng: ' + error.message);
      setUpdating(null);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div>🔄 Đang tải đơn hàng từ Firebase...</div>
    </div>
  );
  
  if (error) return (
    <div style={{ color: 'red', padding: '20px', backgroundColor: '#ffe6e6', borderRadius: '5px' }}>
      <strong>Lỗi:</strong> {error}
      <br />
      <button 
        onClick={fetchOrders}
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
  
  if (orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '18px', marginBottom: '10px' }}>📦 Không có đơn hàng nào</div>
      <button 
        onClick={fetchOrders}
        style={{
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔄 Tải lại
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📋 Quản lý Đơn hàng</h2>
        <button
          onClick={fetchOrders}
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
          🔄 Tải lại ({orders.length} đơn)
        </button>
      </div>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Người đặt</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th>Ngày tạo</th>
            <th>Chi tiết</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customerName || order.userId}</td>
              <td>{order.phone || 'N/A'}</td>
              <td>{order.address || 'N/A'}</td>
              <td>
                <span style={{
                  color: order.status === 'pending' ? 'orange' : 
                         order.status === 'confirmed' ? 'blue' :
                         order.status === 'delivered' ? 'green' : 'red'
                }}>
                  {order.status}
                </span>
              </td>
              <td>{order.total?.toLocaleString() || 0}đ</td>
              <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</td>
              <td>
                <details>
                  <summary>Xem chi tiết</summary>
                  {order.items && order.items.length > 0 ? (
                    <ul>
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          {item.bookTitle || item.productName || 'Sản phẩm'} - 
                          SL: {item.quantity} - 
                          Giá: {(item.bookPrice || item.price || 0).toLocaleString()}đ
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div>Không có chi tiết sản phẩm</div>
                  )}
                  <div><strong>Ghi chú:</strong> {order.note || 'Không có'}</div>
                  <div><strong>Thanh toán:</strong> {order.paymentMethod || 'N/A'}</div>
                </details>
              </td>
              <td>
                {order.status === 'pending' ? (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    disabled={updating === order.id}
                    style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: updating === order.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {updating === order.id ? 'Đang xử lý...' : 'Xác nhận giao hàng'}
                  </button>
                ) : (
                  <span style={{
                    color: order.status === 'confirmed' ? 'green' : 'gray'
                  }}>
                    {order.status === 'confirmed' ? 'Đã xác nhận' : 'Đã xử lý'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrders;
