import React, { useState, useEffect, useRef } from 'react';

const API_URL = "http://localhost:5000/api/messages";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user.fullName || user.email || 'Anonymous';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling để lấy messages mới (simple real-time simulation)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(API_URL);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages(); // Fetch immediately
    const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage,
          username: username
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Refresh messages immediately
        const messagesResponse = await fetch(API_URL);
        if (messagesResponse.ok) {
          const data = await messagesResponse.json();
          setMessages(data);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ chat?')) return;
    
    try {
      const response = await fetch(`${API_URL}/clear`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: 0, color: '#333' }}>💬 Chat Room</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
              Đang chat với tên: <strong>{username}</strong> ({user.role})
            </p>
          </div>
          {user.role === 'admin' && (
            <button
              onClick={clearChat}
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🗑️ Xóa chat
            </button>
          )}
        </div>

        {/* Messages Container */}
        <div style={{
          height: '400px',
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#f8f9fa'
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: '#666',
              marginTop: '50px',
              fontSize: '16px'
            }}>
              💬 Chưa có tin nhắn nào. Hãy gửi tin nhắn đầu tiên!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                style={{
                  marginBottom: '15px',
                  display: 'flex',
                  justifyContent: message.username === username ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  backgroundColor: message.username === username ? '#007bff' : '#fff',
                  color: message.username === username ? 'white' : '#333',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.8,
                    marginBottom: '4px'
                  }}>
                    <strong>{message.username}</strong>
                    {message.createdAt && (
                      <span style={{ marginLeft: '8px' }}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  <div style={{ lineHeight: 1.4 }}>{message.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderTop: '1px solid #dee2e6'
        }}>
          <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nhập tin nhắn..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '25px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: loading ? '#f5f5f5' : 'white'
              }}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              style={{
                padding: '12px 24px',
                backgroundColor: loading || !newMessage.trim() ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                minWidth: '80px'
              }}
            >
              {loading ? '...' : '📤 Gửi'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Chat;
