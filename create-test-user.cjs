const { db, auth } = require('./firebaseAdmin.cjs');

async function createTestUser() {
  try {
    console.log('Creating test user in Firebase Auth...');
    
    // Tạo user trong Firebase Authentication
    const userRecord = await auth.createUser({
      email: 'admin@bookstore.com',
      password: 'admin123',
      displayName: 'Admin BookStore'
    });
    
    console.log('User created in Firebase Auth:', userRecord.uid);
    
    // Tạo thông tin bổ sung trong Firestore
    await db.collection('users').doc('admin@bookstore.com').set({
      email: 'admin@bookstore.com',
      fullName: 'Admin BookStore',
      role: 'admin',
      isActive: true,
      createdAt: Date.now()
    });
    
    console.log('User profile created in Firestore');
    
    // Tạo user manager
    const managerRecord = await auth.createUser({
      email: 'manager@bookstore.com',
      password: 'manager123',
      displayName: 'Manager BookStore'
    });
    
    console.log('Manager created in Firebase Auth:', managerRecord.uid);
    
    await db.collection('users').doc('manager@bookstore.com').set({
      email: 'manager@bookstore.com',
      fullName: 'Manager BookStore',
      role: 'manager',
      isActive: true,
      createdAt: Date.now()
    });
    
    console.log('Manager profile created in Firestore');
    
    console.log('\n✅ Test users created successfully!');
    console.log('📧 Admin: admin@bookstore.com / admin123');
    console.log('📧 Manager: manager@bookstore.com / manager123');
    
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('Users already exist, updating Firestore profiles...');
      
      // Cập nhật profile trong Firestore
      await db.collection('users').doc('admin@bookstore.com').set({
        email: 'admin@bookstore.com',
        fullName: 'Admin BookStore',
        role: 'admin',
        isActive: true,
        createdAt: Date.now()
      });
      
      await db.collection('users').doc('manager@bookstore.com').set({
        email: 'manager@bookstore.com',
        fullName: 'Manager BookStore',
        role: 'manager',
        isActive: true,
        createdAt: Date.now()
      });
      
      console.log('✅ User profiles updated!');
      console.log('📧 Admin: admin@bookstore.com / admin123');
      console.log('📧 Manager: manager@bookstore.com / manager123');
    } else {
      console.error('Error creating test user:', error);
    }
  }
}

// Kiểm tra authentication
async function testAuth() {
  try {
    console.log('\n🔍 Testing authentication...');
    
    // Kiểm tra user trong Firebase Auth
    const userRecord = await auth.getUserByEmail('admin@bookstore.com');
    console.log('✅ User found in Firebase Auth:', userRecord.email);
    
    // Kiểm tra user trong Firestore
    const userDoc = await db.collection('users').doc('admin@bookstore.com').get();
    if (userDoc.exists) {
      console.log('✅ User profile found in Firestore:', userDoc.data());
    } else {
      console.log('❌ User profile NOT found in Firestore');
    }
    
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
  }
}

async function main() {
  await createTestUser();
  await testAuth();
  process.exit(0);
}

if (require.main === module) {
  main();
}
