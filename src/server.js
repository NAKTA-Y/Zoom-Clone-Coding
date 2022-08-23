import express from "express";
import path from "path";
import http from "http";
import { Server } from 'socket.io';

const __dirname = path.resolve();

const app = express();
    
app.set("view engine", "pug");
app.set("views", __dirname + "/src/views");

app.use("/public", express.static(__dirname + "/src/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

/** Same Server */
const httpServer = http.createServer(app);
const ioServer = new Server(httpServer);

httpServer.listen(3000, handleListen);

ioServer.on("connection", socket => {
    socket.on("join_room", roomName => {
        socket.join(roomName);
    });

    socket.on("offer", (offer, roomName) => {
        socket.to(roomName).emit("offer", offer);
    });

    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    });
})