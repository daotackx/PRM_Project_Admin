const express = require('express');
const router = express.Router();
const { db } = require('./firebaseAdmin.cjs');

// Lấy tất cả order
router.get('/', async (req, res) => {
  try {
    console.log('Fetching orders from Firebase...');
    const snapshot = await db.collection('orders').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`Found ${orders.length} orders`);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Lấy chi tiết 1 order
router.get('/:id', async (req, res) => {
  try {
    const doc = await db.collection('orders').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Order not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật trạng thái order
router.put('/:id', async (req, res) => {
  try {
    console.log(`Updating order ${req.params.id} with data:`, req.body);
    const { status, note } = req.body;
    
    // Chỉ update các field không undefined
    const updateData = {
      status,
      updatedAt: Date.now()
    };
    
    if (note !== undefined) {
      updateData.note = note;
    }
    
    await db.collection('orders').doc(req.params.id).update(updateData);
    console.log(`Order ${req.params.id} updated successfully`);
    res.json({ message: 'Order updated' });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({ error: err.message });
  }
});

// Xóa order
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('orders').doc(req.params.id).delete();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

