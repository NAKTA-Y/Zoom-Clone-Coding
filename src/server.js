import express from "express";
import path from "path";
import http from "http";
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';

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
const ioServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    },
});

instrument(ioServer, {
    auth: false
});

function publicRooms() {
    const {
      sockets: {
        adapter: { sids, rooms },
    },
    } = ioServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
      if (sids.get(key) === undefined) {
        publicRooms.push(key);
      }
    });
    return publicRooms;
  }

function countRoom(roomName) {
    return ioServer.sockets.adapter.rooms.get(roomName)?.size;
}

ioServer.on("connection", (socket) => {
    socket["nickname"] = "Anonymous";

    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        ioServer.sockets.emit("room_change", publicRooms());
    });

    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
        });
    })

    socket.on("disconnect", () => {
        ioServer.sockets.emit("room_change", publicRooms());
    })

    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    })

    socket.on("nickname", (nickname, done) => {
        socket["nickname"] = nickname;
        done();
    })
})

httpServer.listen(3000, handleListen);

///////////////////////////////////////////////////////////////

// WebSocket Way

// const sockets = [];

// wss.on("connection", (socket) => {
//     sockets.push(socket);

//     socket["nickname"] = "Anonymous";

//     console.log("Connected to Browser ✅");

//     // event
//     socket.on("close", () => {
//         console.log(`Disconnected from the Browser ❌`);
//     })

//     socket.on("message", (msg) => {
//         const message = JSON.parse(msg);
//         switch(message.type) {
//             case "new_message":
//                 sockets.forEach((aSocket) => (aSocket.send(`${socket.nickname}: ${message.payload}`)));
//                 break;
//             case "nickname":
//                 socket["nickname"] = message.payload;
//                 break;
//         }
//     })
// });
