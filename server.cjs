const express = require('express');
const cors = require('cors');
const orderRoutes = require('./orderRoutes.cjs');
const messageRoutes = require('./messageRoutes.cjs');
const authRoutes = require('./authRoutes.cjs');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
