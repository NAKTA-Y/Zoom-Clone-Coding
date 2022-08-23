const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const messageList = document.querySelector("ul");
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload};
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connected to Server ✅");
})

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li); 
})

socket.addEventListener("close", () => {
    console.log("Disconnected to Server ❌");

})

function handleSubmit(event) {
    event.preventDefault();
    
    const input = messageForm.querySelector("input");

    socket.send(makeMessage("new_message", input.value));

    input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);

function handleNickSubmit(event) {
    event.preventDefault();

    const input = nickForm.querySelector("input");
    const nickname = document.querySelector("#nickDisplay")

    nickname.innerText = `Your NickName: ${input.value}`;

    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

nickForm.addEventListener("submit", handleNickSubmit);