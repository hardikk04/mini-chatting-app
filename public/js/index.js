const socket = io();

const joinForm = document.querySelector(".joinForm");
const username = document.querySelector("#username");

joinForm.addEventListener("click", () => {
  if (username.value) {
    document.querySelector(".middleware").style.display = "none";
    socket.emit("username", username.value);
    username.value = "";
  } else {
    username.value = "Please enter your username";
  }
});

socket.on("user-join", (user) => {
  const { name, id } = user;
  if (socket.id === id) {
    document.querySelector(".name").textContent = name;
    const p = document.createElement("p");
    p.classList.add("text-center");
    p.textContent = `You have joined the chat`;
    document.querySelector(".messages").appendChild(p);
  } else {
    const p = document.createElement("p");
    p.classList.add("text-center");
    p.textContent = `${name} has joined the chat`;
    document.querySelector(".messages").appendChild(p);
  }
});

socket.on("user-leave", (user) => {
  const { name, id } = user;
  if (socket.id !== id) {
    const p = document.createElement("p");
    p.classList.add("text-center");
    p.textContent = `${name} has leaved the chat`;
    document.querySelector(".messages").appendChild(p);
  }
});

socket.on("send-message", (user) => {
  const { message, id, time, username } = user;
  const date = new Date(time);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const clockTime = `${hours}:${minutes} ${ampm}`;
  if (socket.id === id) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add("sent");
    const p = document.createElement("p");
    p.textContent = message;
    const messageTime = document.createElement("small");
    messageTime.classList.add(
      "text-[.8vw]",
      "mt-5",
      "ml-2",
      "relative",
      "right-0",
      "bottom-0",
      "text-zinc-200"
    );
    messageTime.textContent = clockTime;
    div.appendChild(p);
    p.appendChild(messageTime);
    document.querySelector(".messages").appendChild(div);
  } else {
    const user = document.createElement("p");
    user.classList.add("ml-2", "text-sm");
    user.textContent = username;
    document.querySelector(".messages").appendChild(user);

    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add("received");
    const p = document.createElement("p");
    p.textContent = message;
    const messageTime = document.createElement("small");
    messageTime.classList.add(
      "text-[.8vw]",
      "mt-5",
      "ml-2",
      "relative",
      "right-0",
      "bottom-0",
      "text-zinc-400"
    );
    messageTime.textContent = clockTime;
    div.appendChild(p);
    p.appendChild(messageTime);
    document.querySelector(".messages").appendChild(div);
  }
});

socket.on("online-user", (onlineCount) => {
  document.querySelector(".online-count>span").textContent = onlineCount - 1;
});

/* <div class="message sent">
<p>Hello</p>
</div> */

const btn = document.querySelector(".btn");
const message = document.querySelector(".message");
btn.addEventListener("click", () => {
  socket.emit("message", message.value);
  message.value = "";
});

const usernameValidation = document.querySelector("#username");
usernameValidation.addEventListener("input", () => {
  if (usernameValidation.value.trim().length > 0) {
    usernameValidation.value = usernameValidation.value.replace(" ", "_");
  } else {
    usernameValidation.value = "";
  }
});
