import express from "express";
import path from "path";
import http from "http";
import WebSocket from 'ws';

const __dirname = path.resolve();

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");

app.use("/public", express.static(__dirname + "/src/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

/** Same Server */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);

    socket["nickname"] = "Anonymous";

    console.log("Connected to Browser ✅");

    // event
    socket.on("close", () => {
        console.log(`Disconnected from the Browser ❌`);
    })

    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type) {
            case "new_message":
                sockets.forEach((aSocket) => (aSocket.send(`${socket.nickname}: ${message.payload}`)));
                break;
            case "nickname":
                socket["nickname"] = message.payload;
                break;
        }
    })
});

server.listen(3000, handleListen);