const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Lấy project ID từ service account
const projectId = serviceAccount.project_id;

console.log('Firebase Config cho client-side:');
console.log(`
const firebaseConfig = {
  projectId: "${projectId}",
  // Các thông tin khác cần lấy từ Firebase Console
  // Truy cập https://console.firebase.google.com/
  // Chọn project -> Project Settings -> General -> Your apps
  // Thêm web app để lấy đầy đủ config
};
`);

console.log('\nLưu ý: Bạn cần:');
console.log('1. Truy cập Firebase Console');
console.log('2. Chọn project:', projectId);
console.log('3. Vào Project Settings -> General');
console.log('4. Thêm web app để lấy đầy đủ config');
console.log('5. Cập nhật file src/firebase.js với config đầy đủ');

process.exit(0);
