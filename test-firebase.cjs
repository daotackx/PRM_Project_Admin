const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Tạo dữ liệu test
async function createTestOrder() {
  try {
    const orderRef = await db.collection('orders').add({
      userId: 'user123',
      phone: '0123456789',
      address: '123 Test Street',
      status: 'pending',
      total: 100000,
      createdAt: Date.now(),
      items: [
        {
          bookTitle: 'Test Book',
          quantity: 1,
          bookPrice: 100000
        }
      ],
      note: 'Test order',
      paymentMethod: 'COD'
    });
    
    console.log('Test order created with ID:', orderRef.id);
    
    // Test đọc lại
    const snapshot = await db.collection('orders').get();
    console.log('Total orders:', snapshot.size);
    
    snapshot.forEach(doc => {
      console.log('Order:', doc.id, doc.data());
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createTestOrder();
