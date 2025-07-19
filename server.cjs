const express = require('express');
const cors = require('cors');
const messageRoutes = require('./messageRoutes.cjs');

const app = express();
app.use(cors());
app.use(express.json());

// Chỉ giữ message routes cho chat system
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📱 BookStore Admin Backend running on port ${PORT}`));
