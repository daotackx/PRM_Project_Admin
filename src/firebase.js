import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Cấu hình Firebase - SỬ DỤNG CONFIG THẬT
const firebaseConfig = {
  apiKey: "AIzaSyBiMvqIdjIFrCDT-QWCI7yDujWAs1yo6ls",
  authDomain: "prm-project-2943d.firebaseapp.com",
  projectId: "prm-project-2943d",
  storageBucket: "prm-project-2943d.appspot.com",
  messagingSenderId: "768695581248",
  appId: "1:768695581248:android:322ea8553b5f572df7bda5" // Tạm dùng Android config để test
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo Firestore
export const db = getFirestore(app);

// Đối với development, ta sẽ sử dụng cùng Firestore instance như server
// Nếu muốn sử dụng emulator, uncomment dòng sau:
// connectFirestoreEmulator(db, 'localhost', 8080);

export default app;
