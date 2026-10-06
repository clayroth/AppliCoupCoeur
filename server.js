
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const QRCode = require("qrcode");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let votes = 0;
let goal = 100;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "phone.html"));
});

app.get("/qr", async (req, res) => {
  try {
    const proto = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.headers.host;
    const url = `${proto}://${host}/phone.html`;
    const png = await QRCode.toBuffer(url, {
      type: "png",
      width: 420,
      margin: 1,
      color: { dark: "#1683F3", light: "#FFFFFFFF" }
    });
    res.type("png").send(png);
  } catch (err) {
    res.status(500).send("QR generation error");
  }
});

io.on("connection", (socket) => {
  socket.emit("state", { votes, goal });

  socket.on("vote", () => {
    votes += 1;
    io.emit("state", { votes, goal });
    io.emit("celebrate", { votes });
  });

  socket.on("setGoal", (value) => {
    const next = Number(value);
    if (Number.isFinite(next) && next > 0 && next <= 100000) {
      goal = Math.round(next);
      io.emit("state", { votes, goal });
    }
  });

  socket.on("resetVotes", () => {
    votes = 0;
    io.emit("state", { votes, goal });
  });

  socket.on("minusVote", () => {
    votes = Math.max(0, votes - 1);
    io.emit("state", { votes, goal });
  });
});

server.listen(PORT, () => {
  console.log(`Award Bedeez running on port ${PORT}`);
});
