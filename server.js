const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public klasörünü doğru servis et (ÖNEMLİ)
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// sadece bu kullanıcılar girebilir
const users = {
    admin: "1234",
    dogukan: "0000"
};

// online kullanıcılar
let onlineUsers = {};

// mesaj dosyası
const messagesFile = path.join(__dirname, "messages.json");

// mesaj dosyası yoksa oluştur
if (!fs.existsSync(messagesFile)) {
    fs.writeFileSync(messagesFile, JSON.stringify([]));
}

// mesajları yükle
function loadMessages() {
    return JSON.parse(fs.readFileSync(messagesFile));
}

// mesaj kaydet
function saveMessage(msg) {
    const messages = loadMessages();
    messages.push(msg);
    fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
}

// socket bağlantısı
io.on("connection", (socket) => {

    // login kontrol
    socket.on("login", ({ username, password }) => {

        if (!users[username]) {
            socket.emit("loginError", "USER NOT FOUND");
            return;
        }

        if (users[username] !== password) {
            socket.emit("loginError", "WRONG PASSWORD");
            return;
        }

        socket.username = username;
        onlineUsers[username] = socket.id;

        socket.emit("loginSuccess");

        io.emit("userList", Object.keys(users));
    });

    // private mesaj
    socket.on("privateMessage", ({ to, message }) => {

        if (!socket.username) return;

        const msg = {
            from: socket.username,
            to: to,
            message: message,
            time: Date.now()
        };

        saveMessage(msg);

        const targetSocket = onlineUsers[to];

        if (targetSocket) {
            io.to(targetSocket).emit("privateMessage", msg);
        }

        socket.emit("privateMessage", msg);
    });

    // mesaj geçmişi gönder
    socket.on("loadMessages", ({ user1, user2 }) => {

        const messages = loadMessages();

        const filtered = messages.filter(m =>
            (m.from === user1 && m.to === user2) ||
            (m.from === user2 && m.to === user1)
        );

        socket.emit("messageHistory", filtered);
    });

    // disconnect
    socket.on("disconnect", () => {

        if (socket.username) {
            delete onlineUsers[socket.username];
            io.emit("userList", Object.keys(users));
        }

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
