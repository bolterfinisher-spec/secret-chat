const socket = io();

function join(){

    const username = document.getElementById("username").value;

    if(!username) return;

    socket.emit("join", username);

    document.getElementById("login").classList.add("hidden");
    document.getElementById("chat").classList.remove("hidden");

}

function send(){

    const input = document.getElementById("msgInput");

    if(!input.value) return;

    socket.emit("chat", input.value);

    input.value = "";

}

socket.on("message", (data)=>{

    const div = document.createElement("div");

    div.classList.add("message");

    div.innerText = data.user + ": " + data.text;

    document.getElementById("messages").appendChild(div);

});
