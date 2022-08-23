const socket = io();

const welcome = document.querySelector("#welcome");
const roomNameForm = welcome.querySelector("#room-name");
const nameForm = welcome.querySelector("#nickname");
const room = document.querySelector("#room");

let roomName;

room.hidden = true;

nameForm.addEventListener("submit", handleNicknameSubmit);

roomNameForm.addEventListener("submit", handleRoomSubmit);

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${input.value}`);
        input.value = "";
    });
}

function handleNicknameSubmit(event) {
    event.preventDefault();

    const input = welcome.querySelector("#nickname input");
    const showNickname = welcome.querySelector("h3");
    
    socket.emit("nickname", input.value, () => {
        showNickname.innerText = `Your Nickname : ${input.value}`;
        input.value = "";
    });
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;

    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;

    const messageForm = room.querySelector("#msg");
    messageForm.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = roomNameForm.querySelector("input");
    
    socket.emit("enter_room",input.value, showRoom);

    roomName = input.value;

    input.value = "";
} 

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${user} Joined!`);
});

socket.on("bye", (left, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${newCount})`;
    addMessage(`${left} Left..`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if (rooms.length === 0) {
        return;
    }
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li);
    })
})