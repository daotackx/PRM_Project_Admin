const express = require('express');
const router = express.Router();
const { db, auth } = require('./firebaseAdmin.cjs');

// API đăng nhập với Firebase Authentication
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và password là bắt buộc' });
    }

    console.log('Login attempt:', email);

    try {
      // Tìm user trong Firebase Auth
      const userRecord = await auth.getUserByEmail(email);
      console.log('User found in Firebase Auth:', userRecord.uid, userRecord.email);

      // Kiểm tra thông tin bổ sung trong Firestore (nếu có)
      let additionalUserData = {};
      try {
        const userDocRef = db.collection('users').doc(email);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          additionalUserData = userDoc.data();
          console.log('Additional user data from Firestore:', additionalUserData);
        } else {
          // Tạo document cơ bản nếu chưa có
          additionalUserData = {
            role: 'user', // default role
            fullName: userRecord.displayName || userRecord.email.split('@')[0],
            isActive: true,
            createdAt: Date.now()
          };
          await userDocRef.set(additionalUserData);
          console.log('Created default user profile in Firestore');
        }
      } catch (firestoreError) {
        console.log('Firestore error (using defaults):', firestoreError.message);
        additionalUserData = {
          role: 'user',
          fullName: userRecord.displayName || userRecord.email.split('@')[0],
          isActive: true
        };
      }

      // Kiểm tra tài khoản có active không
      if (additionalUserData.isActive === false) {
        console.log('Account is inactive');
        return res.status(401).json({ error: 'Tài khoản đã bị khóa' });
      }

      // Cập nhật thời gian đăng nhập cuối
      try {
        await db.collection('users').doc(email).update({
          lastLogin: Date.now()
        });
      } catch (updateError) {
        console.log('Could not update lastLogin:', updateError.message);
      }

      console.log('Login successful for:', email);

      // Trả về thông tin user
      res.json({
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          fullName: additionalUserData.fullName || userRecord.displayName || userRecord.email.split('@')[0],
          role: additionalUserData.role || 'user',
          isActive: additionalUserData.isActive !== false,
          loginTime: Date.now()
        }
      });

    } catch (authError) {
      console.log('User not found in Firebase Auth:', authError.message);
      return res.status(401).json({ error: 'Email hoặc password không đúng' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API lấy danh sách users từ Firebase Auth
router.get('/users', async (req, res) => {
  try {
    console.log('Fetching all users from Firebase Auth...');
    
    const listUsersResult = await auth.listUsers();
    console.log(`Found ${listUsersResult.users.length} users in Firebase Auth`);
    
    const users = [];
    
    for (const userRecord of listUsersResult.users) {
      // Lấy thông tin bổ sung từ Firestore
      let additionalData = {};
      try {
        const userDocRef = db.collection('users').doc(userRecord.email);
        const userDoc = await userDocRef.get();
        if (userDoc.exists) {
          additionalData = userDoc.data();
        }
      } catch (error) {
        console.log(`Could not fetch additional data for ${userRecord.email}:`, error.message);
      }
      
      users.push({
        uid: userRecord.uid,
        email: userRecord.email,
        fullName: additionalData.fullName || userRecord.displayName || userRecord.email.split('@')[0],
        role: additionalData.role || 'user',
        isActive: additionalData.isActive !== false,
        createdAt: additionalData.createdAt || userRecord.metadata.creationTime,
        lastLogin: additionalData.lastLogin,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled
      });
    }
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: error.message });
  }
});

// API tạo user mới (chỉ admin)
router.post('/users', async (req, res) => {
  try {
    const { email, password, role, fullName } = req.body;
    
    if (!email || !password || !role || !fullName) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    await userRef.set({
      email,
      password,
      role,
      fullName,
      createdAt: Date.now(),
      isActive: true
    });

    res.json({ message: 'Tạo tài khoản thành công' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// API cập nhật user (chỉ admin)
router.put('/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { role, fullName, isActive } = req.body;
    
    const userRef = db.collection('users').doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Không tìm thấy user' });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = Date.now();

    await userRef.update(updateData);

    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: error.message });
  }
});

// API update role user
router.put('/users/:email/role', async (req, res) => {
  try {
    const { email } = req.params;
    const { role } = req.body;
    
    console.log(`Updating role for user ${email} to ${role}`);
    
    // Cập nhật role trong Firestore
    const userDocRef = db.collection('users').doc(email);
    await userDocRef.update({
      role: role,
      updatedAt: new Date()
    });
    
    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message });
  }
});

// API toggle active status
router.put('/users/:email/toggle-active', async (req, res) => {
  try {
    const { email } = req.params;
    const { isActive } = req.body;
    
    console.log(`Toggling active status for user ${email} to ${isActive}`);
    
    // Cập nhật isActive trong Firestore
    const userDocRef = db.collection('users').doc(email);
    await userDocRef.update({
      isActive: isActive,
      updatedAt: new Date()
    });
    
    // Disable/enable user trong Firebase Auth
    try {
      const userRecord = await auth.getUserByEmail(email);
      await auth.updateUser(userRecord.uid, { disabled: !isActive });
    } catch (authError) {
      console.warn('Could not update Firebase Auth user status:', authError.message);
    }
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
