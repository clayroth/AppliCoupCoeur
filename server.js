
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

let liveText = {
  title: "Award Bedeez",
  phoneSubtitle: "Fais monter la jauge ! Chaque clic compte et s’affiche instantanément sur l’écran de l’événement.",
  screenSubtitle: "Scanne le QR code, vote depuis ton téléphone et regarde la jauge grimper en direct !",
  voteButton: "⭐ Voter pour l’Award",
  specialMessage: ""
};

let ui = {
  titleColor: "#1683F3",
  titleSize: 96,
  subtitleColor: "#6E8092",
  subtitleSize: 20,
  qrVisible: true,
  mascotVisible: true,
  progressVisible: true
};

function state() {
  return { votes, goal, liveText, ui };
}

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
  socket.emit("state", state());

  socket.on("vote", () => {
    votes += 1;
    io.emit("state", state());
    io.emit("celebrate", { votes });
  });

  socket.on("setGoal", (value) => {
    const next = Number(value);
    if (Number.isFinite(next) && next > 0 && next <= 100000) {
      goal = Math.round(next);
      io.emit("state", state());
    }
  });

  socket.on("setLiveText", (nextText) => {
    if (!nextText || typeof nextText !== "object") return;

    const clean = (value, fallback, max = 220) => {
      if (typeof value !== "string") return fallback;
      const trimmed = value.trim();
      return trimmed.slice(0, max);
    };

    liveText = {
      title: clean(nextText.title, liveText.title, 60) || liveText.title,
      phoneSubtitle: clean(nextText.phoneSubtitle, liveText.phoneSubtitle, 220),
      screenSubtitle: clean(nextText.screenSubtitle, liveText.screenSubtitle, 220),
      voteButton: clean(nextText.voteButton, liveText.voteButton, 70) || liveText.voteButton,
      specialMessage: clean(nextText.specialMessage, liveText.specialMessage, 180)
    };

    io.emit("state", state());
  });

  socket.on("setUi", (nextUi) => {
    if (!nextUi || typeof nextUi !== "object") return;

    const safeColor = (value, fallback) =>
      typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value) ? value : fallback;

    const safeNum = (value, fallback, min, max) => {
      const n = Number(value);
      return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : fallback;
    };

    ui = {
      titleColor: safeColor(nextUi.titleColor, ui.titleColor),
      titleSize: safeNum(nextUi.titleSize, ui.titleSize, 36, 180),
      subtitleColor: safeColor(nextUi.subtitleColor, ui.subtitleColor),
      subtitleSize: safeNum(nextUi.subtitleSize, ui.subtitleSize, 12, 60),
      qrVisible: Boolean(nextUi.qrVisible),
      mascotVisible: Boolean(nextUi.mascotVisible),
      progressVisible: Boolean(nextUi.progressVisible)
    };

    io.emit("state", state());
  });

  socket.on("launchWinner", () => {
    io.emit("winner");
  });

  socket.on("minusVote", () => {
    votes = Math.max(0, votes - 1);
    io.emit("state", state());
  });

  socket.on("resetVotes", () => {
    votes = 0;
    io.emit("state", state());
  });
});

server.listen(PORT, () => {
  console.log(`Award Bedeez running on port ${PORT}`);
});
