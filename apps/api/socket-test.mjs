import { io } from "socket.io-client";

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error("Missing TOKEN env var. Run with: TOKEN=... node socket-test.mjs");
  process.exit(1);
}

const CHAT_ID = "40a9413a-e6e8-492e-86ab-e1c434ddd046";

const socket = io("http://localhost:3000", {
  auth: { token: TOKEN.trim() },
  transports: ["websocket"],
  path: "/socket.io",
});

socket.on("connect", () => {
  console.log("connected", socket.id);

  socket.emit("joinChat", { chatId: CHAT_ID }, (ack) => console.log("join ack", ack));

  socket.on("newMessage", (msg) => console.log("newMessage", msg));
  socket.on("typing", (p) => console.log("typing", p));
  socket.on("readReceipt", (p) => console.log("readReceipt", p));

  // send message
  socket.emit(
    "sendMessage",
    { chatId: CHAT_ID, content: "Hello realtime + typing + seen!" },
    (ack) => console.log("send ack", ack),
  );

  // typing demo
  socket.emit("typing:start", { chatId: CHAT_ID }, (ack) => console.log("typing start ack", ack));
  setTimeout(() => {
    socket.emit("typing:stop", { chatId: CHAT_ID }, (ack) => console.log("typing stop ack", ack));
  }, 1200);

  // seen demo (lastReadMsgId는 실제 메시지 id로 교체하면 더 정확)
  setTimeout(() => {
    socket.emit("messages:seen", { chatId: CHAT_ID }, (ack) => console.log("seen ack", ack));
  }, 1800);
});

socket.on("connect_error", (err) => console.log("connect_error", err.message));