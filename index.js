const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
require("./config");
const db = require("./firebase");
const {
  getDocs,
  collection,
  addDoc,
  deleteDoc,
  doc,
} = require("firebase/firestore");

app.use(express.json());

const sf = (res, filePath) => res.sendFile(__dirname + "/public/" + filePath);

app.get("/", (_, res) => sf(res, "index.html"));
app.get('/style.css', (_, res) => sf(res, "style.css"));
app.get('/main.js', (_, res) => sf(res, "main.js"));
app.get('/assets/logo.png', (_, res) => sf(res, "assets/logo.png"));
app.get('/assets/bg.gif', (_, res) => sf(res, "assets/bg.gif"));
app.get('/libs/socket.io.js', (_, res) => sf(res, "libs/socket.io.js"));
app.get('/libs/moment.js', (_, res) => sf(res, "libs/moment.js"));
app.get('/libs/tailwind-all.css', (_, res) => sf(res, "libs/tailwind-all.css"));

io.on("connection", (socket) => {
  socket.on("getMessages", () => {
    const data = [];
    getDocs(collection(db, "miniChatMessages")).then((e) => {
      e.docs.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      io.sockets.emit("readMessages", data);
    });
  });

  socket.on("sendMessage", (req) => {
    addDoc(collection(db, "miniChatMessages"), req).then((e) => {
      io.sockets.emit("readNewMessage", { id: e.id, ...req });
    });
  });

  socket.on("deleteMessage", (req) => {
    deleteDoc(doc(db, "miniChatMessages", req.id)).then(() => {
      io.sockets.emit("removeMessage", req);
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
