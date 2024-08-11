const input = document.getElementById("input");
const username = document.getElementById("username");
const block = document.getElementById("block");
const socket = io.connect("/");

(function getData() {
  socket.emit("getMessages");
})();

let messages = [];

socket.on("readMessages", (data) => {
  messages = data;
  drawer(data);
});

socket.on("readNewMessage", (data) => {
  messages.push(data);
  drawer(messages);
  if (localStorage.getItem("username") !== data.from) {
    if ("Notification" in window) {
      Notification.requestPermission();
      if (Notification.permission === "granted") {
        const notification = new Notification(data.from, {
          body: data.msg,
          vibrate: [200, 100, 200],
        });
        notification.addEventListener("click", () => {
          window.open("https://webminichat.onrender.com");
        });
        setTimeout(() => notification.close(), 5 * 2000);
      }
    }
  }
});

socket.on("removeMessage", (data) => {
  messages.map((item, index) => {
    if (item.id === data.id) messages.splice(index, 1);
  });
  drawer(messages);
});

username.value = localStorage.getItem("username");

function saveName() {
  localStorage.setItem("username", username.value);
  drawer(messages);
}

function sendMessage() {
  if (username.value && input.value) {
    socket.emit("sendMessage", {
      msg: input.value,
      from: username.value,
      date: JSON.stringify(new Date()),
    });
    input.value = "";
  }
}

function deleteMessage(id) {
  socket.emit("deleteMessage", { id });
}

function drawer(array) {
  block.innerHTML = array
    .sort((a, b) => new Date(JSON.parse(a.date)) - new Date(JSON.parse(b.date)))
    .map(
      (item) => `<div class="${
        item.from === localStorage.getItem("username") ? "mymsg-ctx" : "msg-ctx"
      }">
        <div class="msg">
          <div>
            ${
              item.from === localStorage.getItem("username")
                ? `<button onclick="deleteMessage('${item.id}')">-</button>`
                : ""
            }
            <p>${item.from}</p>
          </div>
          ${
            item.msg.substring(0, 8) === "https://" ||
            item.msg.substring(0, 10) === "data:image"
              ? `<img src="${item.msg}" />`
              : `<h1>${item.msg}</h1>`
          }
          <div class="date">${moment(JSON.parse(item.date)).format(
            "DD MMM yy"
          )}</div>
        </div>
      </div>`
    )
    .join("");
  block.scrollTop = block.scrollHeight;
}
