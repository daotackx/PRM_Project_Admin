import React, { useState, useEffect, useRef } from 'react';

const API_URL = "http://localhost:5000/api/messages";

function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Lấy thông tin admin từ localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.fullName || user.email || 'Admin';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Lấy danh sách cuộc hội thoại
  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Lấy tin nhắn của cuộc hội thoại được chọn
  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/conversations/${conversationId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Polling để cập nhật real-time
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, []);

  // Khi chọn cuộc hội thoại
  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await fetchMessages(conversation.id);
    
    // Đánh dấu đã đọc cho admin
    try {
      await fetch(`${API_URL}/conversations/${conversation.id}/mark-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ readerType: 'admin' }),
      });
      fetchConversations(); // Refresh để cập nhật trạng thái
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // Gửi tin nhắn
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: newMessage,
          senderName: adminName,
          senderType: 'admin'
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages(selectedConversation.id);
        fetchConversations(); // Refresh conversations
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // Polling tin nhắn khi có cuộc hội thoại được chọn
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  return (
    <div style={{ display: 'flex', height: '600px', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar - Danh sách cuộc hội thoại */}
      <div style={{
        width: '350px',
        backgroundColor: 'white',
        borderRight: '1px solid #e1e5e9',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #e1e5e9',
          backgroundColor: '#4267b2',
          color: 'white'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>💬 Chat với Khách hàng BookStore</h3>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
            {conversations.length} cuộc hội thoại
          </p>
        </div>

        {/* Danh sách cuộc hội thoại */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#666',
              fontSize: '14px'
            }}>
              Chưa có cuộc hội thoại nào
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                style={{
                  padding: '15px',
                  borderBottom: '1px solid #f0f0f0',
                  cursor: 'pointer',
                  backgroundColor: selectedConversation?.id === conversation.id ? '#e3f2fd' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (selectedConversation?.id !== conversation.id) {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedConversation?.id !== conversation.id) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#4267b2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '16px',
                  marginRight: '12px'
                }}>
                  {conversation.userName.charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginBottom: '2px'
                  }}>
                    {conversation.userName}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conversation.lastMessage || 'Chưa có tin nhắn'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    marginTop: '2px'
                  }}>
                    {conversation.lastMessageTime && 
                      new Date(conversation.lastMessageTime).toLocaleString()
                    }
                  </div>
                </div>

                {/* Unread indicator */}
                {conversation.hasUnreadAdmin && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#42a5f5',
                    position: 'absolute',
                    top: '10px',
                    right: '10px'
                  }}></div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div style={{
              padding: '15px',
              backgroundColor: 'white',
              borderBottom: '1px solid #e1e5e9',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                backgroundColor: '#4267b2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '14px',
                marginRight: '12px'
              }}>
                {selectedConversation.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                  {selectedConversation.userName}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  ID: {selectedConversation.userId}
                </div>
              </div>
            </div>

            {/* Messages area */}
            <div style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              backgroundColor: '#f8f9fa'
            }}>
              {messages.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  marginTop: '50px',
                  fontSize: '14px'
                }}>
                  Chưa có tin nhắn nào
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: message.senderType === 'admin' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      maxWidth: '70%',
                      padding: '8px 12px',
                      borderRadius: '18px',
                      backgroundColor: message.senderType === 'admin' ? '#4267b2' : '#e4e6ea',
                      color: message.senderType === 'admin' ? 'white' : '#333'
                    }}>
                      <div style={{
                        fontSize: '11px',
                        opacity: 0.8,
                        marginBottom: '2px'
                      }}>
                        {message.senderName} • {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                      <div style={{ fontSize: '14px', lineHeight: 1.4 }}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div style={{
              padding: '15px',
              backgroundColor: 'white',
              borderTop: '1px solid #e1e5e9'
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
                    padding: '10px 15px',
                    border: '1px solid #ddd',
                    borderRadius: '20px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !newMessage.trim()}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: loading || !newMessage.trim() ? '#ccc' : '#4267b2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {loading ? '...' : 'Gửi'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            color: '#666',
            fontSize: '16px'
          }}>
            Chọn một cuộc hội thoại để bắt đầu chat
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminChat;
