// Test API để kiểm tra orders
const fetch = require('node-fetch');

async function testOrdersAPI() {
  try {
    console.log('🔍 Testing Orders API...');
    
    const response = await fetch('http://localhost:5000/api/orders');
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ API works! Found ${data.length} orders:`);
      data.forEach((order, index) => {
        console.log(`${index + 1}. Order ${order.id}:`);
        console.log(`   - Customer: ${order.customerName || order.userId}`);
        console.log(`   - Status: ${order.status}`);
        console.log(`   - Total: ${order.total}đ`);
        console.log(`   - Items: ${order.items?.length || 0} items`);
        console.log('');
      });
    } else {
      console.log('❌ API Error:', data);
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    console.log('💡 Make sure server is running on port 5000');
  }
}

testOrdersAPI();
