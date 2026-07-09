const jwt = require("jsonwebtoken");

let io;

const onlineUsers = new Map();

/*
onlineUsers

{
userId -> socketId
}
*/

function initializeSocket(server) {
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token)
                return next(new Error("Unauthorized"));

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            socket.userId = decoded.id;

            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {

        console.log(
            "Socket Connected:",
            socket.userId
        );

        onlineUsers.set(
            socket.userId,
            socket.id
        );

        io.emit(
            "online-users",
            Array.from(onlineUsers.keys())
        );

        socket.on("disconnect", () => {

            onlineUsers.delete(socket.userId);

            io.emit(
                "online-users",
                Array.from(onlineUsers.keys())
            );

            console.log(
                "Disconnected:",
                socket.userId
            );
        });
    });
}

function getIO() {
    return io;
}

function getUserSocket(userId) {
    return onlineUsers.get(userId.toString());
}
function emitToUser(userId, event, payload) {

    const socketId = getUserSocket(userId);

    if (!socketId) return;

    io.to(socketId).emit(event, payload);

}

module.exports = {
    initializeSocket,
    getIO,
    getUserSocket,
    emitToUser,
};

