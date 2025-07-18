const express = require('express');
const router = express.Router();
const { db } = require('./firebaseAdmin.cjs');

// Lấy danh sách cuộc hội thoại (conversations)
router.get('/conversations', async (req, res) => {
  try {
    console.log('Fetching conversations from Firebase...');
    const snapshot = await db.collection('conversations').orderBy('lastMessageTime', 'desc').get();
    const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${conversations.length} conversations`);
    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy tin nhắn của một cuộc hội thoại
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    console.log(`Fetching messages for conversation ${conversationId}...`);
    
    const snapshot = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();
    
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${messages.length} messages for conversation ${conversationId}`);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Gửi tin nhắn
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text, senderName, senderType } = req.body; // senderType: 'user' hoặc 'admin'
    
    console.log(`Adding message to conversation ${conversationId}:`, { text, senderName, senderType });
    
    const now = Date.now();
    const messageData = {
      text,
      senderName,
      senderType,
      createdAt: now,
      isRead: false
    };
    
    // Thêm tin nhắn vào subcollection
    const messageRef = await db.collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add(messageData);
    
    // Cập nhật thông tin cuộc hội thoại
    await db.collection('conversations').doc(conversationId).update({
      lastMessage: text,
      lastMessageTime: now,
      lastMessageSender: senderName,
      hasUnreadAdmin: senderType === 'user', // Nếu user gửi thì admin chưa đọc
      hasUnreadUser: senderType === 'admin'   // Nếu admin gửi thì user chưa đọc
    });
    
    console.log('Message added with ID:', messageRef.id);
    res.json({ id: messageRef.id, message: 'Message added successfully' });
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Tạo cuộc hội thoại mới (từ app Android)
router.post('/conversations', async (req, res) => {
  try {
    const { userId, userName, initialMessage } = req.body;
    
    console.log('Creating new conversation:', { userId, userName, initialMessage });
    
    // Kiểm tra xem đã có cuộc hội thoại với user này chưa
    const existingConversation = await db.collection('conversations')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (!existingConversation.empty) {
      const conversationId = existingConversation.docs[0].id;
      console.log('Found existing conversation:', conversationId);
      
      // Nếu có tin nhắn đầu tiên, gửi luôn
      if (initialMessage) {
        await db.collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .add({
            text: initialMessage,
            senderName: userName,
            senderType: 'user',
            createdAt: Date.now(),
            isRead: false
          });
        
        // Cập nhật thông tin cuộc hội thoại
        await db.collection('conversations').doc(conversationId).update({
          lastMessage: initialMessage,
          lastMessageTime: Date.now(),
          lastMessageSender: userName,
          hasUnreadAdmin: true,
          hasUnreadUser: false
        });
      }
      
      return res.json({ conversationId, message: 'Using existing conversation' });
    }
    
    // Tạo cuộc hội thoại mới
    const now = Date.now();
    const conversationData = {
      userId,
      userName,
      createdAt: now,
      lastMessage: initialMessage || '',
      lastMessageTime: now,
      lastMessageSender: userName,
      hasUnreadAdmin: !!initialMessage,
      hasUnreadUser: false,
      status: 'active'
    };
    
    const conversationRef = await db.collection('conversations').add(conversationData);
    
    // Nếu có tin nhắn đầu tiên, thêm vào subcollection
    if (initialMessage) {
      await db.collection('conversations')
        .doc(conversationRef.id)
        .collection('messages')
        .add({
          text: initialMessage,
          senderName: userName,
          senderType: 'user',
          createdAt: now,
          isRead: false
        });
    }
    
    console.log('New conversation created with ID:', conversationRef.id);
    res.json({ conversationId: conversationRef.id, message: 'Conversation created successfully' });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ error: err.message });
  }
});

// Đánh dấu tin nhắn đã đọc
router.put('/conversations/:conversationId/mark-read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { readerType } = req.body; // 'admin' hoặc 'user'
    
    console.log(`Marking conversation ${conversationId} as read by ${readerType}`);
    
    const updateData = {};
    if (readerType === 'admin') {
      updateData.hasUnreadAdmin = false;
    } else if (readerType === 'user') {
      updateData.hasUnreadUser = false;
    }
    
    await db.collection('conversations').doc(conversationId).update(updateData);
    
    res.json({ message: 'Conversation marked as read' });
  } catch (err) {
    console.error('Error marking conversation as read:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy tất cả messages (API cũ - giữ lại để tương thích)
router.get('/', async (req, res) => {
  try {
    console.log('Fetching messages from Firebase...');
    const snapshot = await db.collection('messages').orderBy('createdAt', 'asc').get();
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${messages.length} messages`);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});

// Thêm message mới (API cũ - giữ lại để tương thích)
router.post('/', async (req, res) => {
  try {
    const { text, username } = req.body;
    console.log('Adding message:', { text, username });
    
    const messageRef = await db.collection('messages').add({
      text,
      username,
      createdAt: Date.now()
    });
    
    console.log('Message added with ID:', messageRef.id);
    res.json({ id: messageRef.id, message: 'Message added successfully' });
  } catch (err) {
    console.error('Error adding message:', err);
    res.status(500).json({ error: err.message });
  }
});

// Xóa tất cả messages (cho testing)
router.delete('/clear', async (req, res) => {
  try {
    const snapshot = await db.collection('messages').get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log('All messages cleared');
    res.json({ message: 'All messages cleared' });
  } catch (err) {
    console.error('Error clearing messages:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
