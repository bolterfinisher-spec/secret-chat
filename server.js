const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public klasörünü aktif et
app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// kullanıcı listesi (sadece bunlar girebilir)
const users = {
    "admin": "1234",
    "dogukan": "0000"
};

io.on("connection", (socket) => {

    socket.on("join", (username) => {

        socket.username = username;

        io.emit("message", "[SYSTEM] " + username + " connected");

    });

    socket.on("chat", (msg) => {

        io.emit("message", socket.username + ": " + msg);

    });

    socket.on("disconnect", () => {

        if(socket.username){
            io.emit("message", "[SYSTEM] " + socket.username + " disconnected");
        }

    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {

    console.log("Server running on port " + PORT);

});