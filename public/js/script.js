const socket = io();

const inputMessage = document.querySelector("input");
const sendBtn = document.querySelector("button");

sendBtn.addEventListener("click", () => {
  //   console.log(inputMessage.value);

  socket.emit("client-message", inputMessage.value);
  inputMessage.value = "";
});

const msgContainer = document.querySelector(".messages");
function scrollToBottom() {
  msgContainer.scrollTop = msgContainer.scrollHeight;
}

socket.on("server-message", ({ message, id }) => {
  if (id === socket.id) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add("sent");
    const p = document.createElement("p");
    p.textContent = message;
    div.appendChild(p);
    document.querySelector(".messages").appendChild(div);
    document.querySelector(".typing").classList.add("hidden");
    scrollToBottom();
  } else {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add("received");
    const p = document.createElement("p");
    p.textContent = message;
    div.appendChild(p);
    document.querySelector(".messages").appendChild(div);
    document.querySelector(".typing").classList.add("hidden");
    scrollToBottom();
  }
});

inputMessage.addEventListener("input", (event) => {
  if (event.target.value.length > 0) {
    socket.emit("typing", true);
  } else {
    socket.emit("typing", false);
  }
});

socket.on("user-typing", ({ typing, id }) => {
  if (typing) {
    if (id === socket.id) {
      document.querySelector(".typing").classList.remove("hidden");
    } else {
      document.querySelector(".typing").classList.remove("hidden");
    }
  } else {
    document.querySelector(".typing").classList.add("hidden");
  }
});
