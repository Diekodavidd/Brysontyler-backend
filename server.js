const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src_/config_/db');

dotenv.config();

console.log("ENV FILE:", process.env.MONGO_URI);
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
// const {
//     initializeSocket,
// } = require("./socket/socket");

// initializeSocket(server);
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./src_/routes_/authRoutes'));
app.use('/content', require('./src_/routes_/contentRoutes'));
app.use('/kyc', require('./src_/routes_/kycRoutes'));
app.use('/payments', require('./src_/routes_/paymentRoutes'));
app.use('/subscriptions', require('./src_/routes_/subscriptionRoutes'));
app.use('/creator', require('./src_/routes_/creatorRoutes'));
app.use('/live', require('./src_/routes_/liveRoutes'));
app.use('/admin', require('./src_/routes_/adminRoutes'));
app.use('/webhooks', require('./src_/routes_/webhookRoutes'));
app.use('/coins', require('./src_/routes_/coinRoutes'));
app.use('/models', require('./src_/routes_/modelRoutes'));
app.use('/collaboration', require('./src_/routes_/collaborationRoutes'));
app.use('/twitter', require('./src_/routes_/twitterRoutes'));
app.use('/wallet', require('./src_/routes_/walletRoutes'));
app.use('/fan', require('./src_/routes_/fanRoutes'));
app.use(
    "/membership",
    require("./src_/routes_/membershipRoutes")
);


const {
  verifyEmailConnection,
} = require("./src_/services/emailService");

verifyEmailConnection();
// WebSocket Chat
io.on('connection', (socket) => {
console.log('User connected:', socket.id);
socket.on('join-room', (roomId) => socket.join(roomId));
socket.on('send-message', ({ roomId, message, user }) => {
io.to(roomId).emit('receive-message', { message, user });
});
socket.on('disconnect', () => console.log('User disconnected'));
});

app.get('/', (req, res) => res.send('Bryson Tyler Productions API Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));



