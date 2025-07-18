const { db } = require('./firebaseAdmin.cjs');

// Xóa tất cả dữ liệu mẫu
async function clearAllData() {
  try {
    console.log('🗑️ Clearing all sample data...');
    
    // Xóa orders
    const ordersSnapshot = await db.collection('orders').get();
    const ordersBatch = db.batch();
    ordersSnapshot.docs.forEach(doc => {
      ordersBatch.delete(doc.ref);
    });
    await ordersBatch.commit();
    console.log(`✅ Deleted ${ordersSnapshot.docs.length} orders`);
    
    // Xóa conversations
    const conversationsSnapshot = await db.collection('conversations').get();
    const convBatch = db.batch();
    
    for (const convDoc of conversationsSnapshot.docs) {
      // Xóa messages trong mỗi conversation
      const messagesSnapshot = await convDoc.ref.collection('messages').get();
      messagesSnapshot.docs.forEach(msgDoc => {
        convBatch.delete(msgDoc.ref);
      });
      // Xóa conversation
      convBatch.delete(convDoc.ref);
    }
    await convBatch.commit();
    console.log(`✅ Deleted ${conversationsSnapshot.docs.length} conversations`);
    
    // Xóa old messages collection
    const messagesSnapshot = await db.collection('messages').get();
    const msgBatch = db.batch();
    messagesSnapshot.docs.forEach(doc => {
      msgBatch.delete(doc.ref);
    });
    await msgBatch.commit();
    console.log(`✅ Deleted ${messagesSnapshot.docs.length} old messages`);
    
    console.log('🎉 All sample data cleared successfully!');
    console.log('📱 Ready for real data from your BookStore Android app!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  }
}

// Chạy hàm xóa dữ liệu
async function main() {
  await clearAllData();
  console.log('\n📚 Your BookStore is now clean and ready!');
  console.log('🔗 Connect your Android app to start receiving real orders and messages.');
  process.exit(0);
}

if (require.main === module) {
  main();
}
