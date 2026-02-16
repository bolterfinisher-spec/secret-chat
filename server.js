const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// static files
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {

    socket.on("join", (username) => {
        socket.username = username;
        io.emit("message", {
            user: "SYSTEM",
            text: username + " joined"
        });
    });

    socket.on("chat", (msg) => {
        io.emit("message", {
            user: socket.username,
            text: msg
        });
    });

    socket.on("disconnect", () => {
        if(socket.username){
            io.emit("message", {
                user: "SYSTEM",
                text: socket.username + " left"
            });
        }
    });

});

server.listen(PORT, () => {
    console.log("Server running on " + PORT);
});
