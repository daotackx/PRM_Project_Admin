import React, { useState } from 'react';
import AdminOrders from './AdminOrders';
import AdminChat from './AdminChat';
import UserManagement from './UserManagement';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('orders');

  const hasPermission = (requiredRole) => {
    const roleHierarchy = { admin: 3, manager: 2, user: 1 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        backgroundColor: 'white',
        padding: '15px 30px',
        borderBottom: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>� BookStore Admin</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Xin chào, <strong>{user.fullName || user.email}</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              Role: {user.role.toUpperCase()} | {user.email}
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        backgroundColor: 'white',
        padding: '0 30px',
        borderBottom: '1px solid #ddd'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {hasPermission('manager') && (
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '15px 20px',
                backgroundColor: activeTab === 'orders' ? '#4CAF50' : 'transparent',
                color: activeTab === 'orders' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'orders' ? '3px solid #4CAF50' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📋 Quản lý Đơn hàng
            </button>
          )}
          
          {hasPermission('manager') && (
            <button
              onClick={() => setActiveTab('admin-chat')}
              style={{
                padding: '15px 20px',
                backgroundColor: activeTab === 'admin-chat' ? '#4CAF50' : 'transparent',
                color: activeTab === 'admin-chat' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'admin-chat' ? '3px solid #4CAF50' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              � Chat với Khách hàng
            </button>
          )}

          {hasPermission('admin') && (
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '15px 20px',
                backgroundColor: activeTab === 'users' ? '#4CAF50' : 'transparent',
                color: activeTab === 'users' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'users' ? '3px solid #4CAF50' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              👥 Quản lý Users
            </button>
          )}

          {hasPermission('admin') && (
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                padding: '15px 20px',
                backgroundColor: activeTab === 'settings' ? '#4CAF50' : 'transparent',
                color: activeTab === 'settings' ? 'white' : '#666',
                border: 'none',
                borderBottom: activeTab === 'settings' ? '3px solid #4CAF50' : '3px solid transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ⚙️ Cài đặt
            </button>
          )}
        </div>
      </nav>

      {/* Content */}
      <main style={{ padding: '30px' }}>
        {activeTab === 'orders' && hasPermission('manager') && <AdminOrders />}
        {activeTab === 'admin-chat' && hasPermission('manager') && <AdminChat />}
        {activeTab === 'users' && hasPermission('admin') && <UserManagement />}
        {activeTab === 'settings' && hasPermission('admin') && <SettingsPanel />}
      </main>
    </div>
  );
}

// Component Settings Panel chỉ dành cho Admin
function SettingsPanel() {
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'BookStore Admin',
    maxOrdersPerDay: 100,
    autoApproveOrders: false,
    enableNotifications: true
  });

  const handleSettingChange = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>Cài đặt hệ thống</h2>
      
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Tên website
          </label>
          <input
            type="text"
            value={systemSettings.siteName}
            onChange={(e) => handleSettingChange('siteName', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Số đơn hàng tối đa mỗi ngày
          </label>
          <input
            type="number"
            value={systemSettings.maxOrdersPerDay}
            onChange={(e) => handleSettingChange('maxOrdersPerDay', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={systemSettings.autoApproveOrders}
              onChange={(e) => handleSettingChange('autoApproveOrders', e.target.checked)}
            />
            <span style={{ fontWeight: 'bold' }}>Tự động phê duyệt đơn hàng</span>
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={systemSettings.enableNotifications}
              onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
            />
            <span style={{ fontWeight: 'bold' }}>Bật thông báo</span>
          </label>
        </div>

        <button
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => alert('Cài đặt đã được lưu!')}
        >
          Lưu cài đặt
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
