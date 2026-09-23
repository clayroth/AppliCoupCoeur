const express = require("express");
const http = require("http");
const os = require("os");
const path = require("path");
const QRCode = require("qrcode");
const { Server } = require("socket.io");

const app = express();
app.set("trust proxy", true);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000;

// ======================================================
// RÉGLAGES DE LA JAUGE
// ======================================================
const BOOST_PER_TAP = 0.25;  // 400 clics = 100 %
const MAX_PROGRESS = 100;
// ======================================================

let progress = 0;
let totalBoosts = 0;
let connectedUsers = 0;

function getLocalIPv4() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const [name, nets] of Object.entries(interfaces)) {
    for (const net of nets || []) {
      if (
        net.family === "IPv4" &&
        !net.internal &&
        !net.address.startsWith("169.254.")
      ) {
        let score = 10;

        if (/virtual|vmware|vbox|hyper-v|tailscale|docker|wsl|vpn|loopback/i.test(name)) {
          score += 50;
        }
        if (/wi-?fi|wlan|ethernet|eth/i.test(name)) {
          score -= 5;
        }
        if (
          net.address.startsWith("192.168.") ||
          net.address.startsWith("10.") ||
          /^172\.(1[6-9]|2\d|3[01])\./.test(net.address)
        ) {
          score -= 2;
        }

        candidates.push({ address: net.address, name, score });
      }
    }
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0]?.address || "localhost";
}

function isPublicHost(req) {
  const forwardedHost = req.get("x-forwarded-host");
  const host = forwardedHost || req.get("host") || "";
  const hostname = host.split(":")[0].toLowerCase();

  if (!hostname) return false;

  return !(
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

function getPhoneUrl(req) {
  if (isPublicHost(req)) {
    const forwardedProto = req.get("x-forwarded-proto");
    const proto = forwardedProto || req.protocol || "https";
    const host = req.get("x-forwarded-host") || req.get("host");
    return `${proto}://${host}/phone.html`;
  }

  return `http://${getLocalIPv4()}:${PORT}/phone.html`;
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.redirect("/screen.html");
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/config/network", (req, res) => {
  res.json({
    phoneUrl: getPhoneUrl(req),
    mode: isPublicHost(req) ? "online" : "local",
    localIp: getLocalIPv4(),
    port: PORT
  });
});

app.get("/qr.png", async (req, res) => {
  try {
    const phoneUrl = getPhoneUrl(req);
    const png = await QRCode.toBuffer(phoneUrl, {
      type: "png",
      width: 700,
      margin: 2,
      errorCorrectionLevel: "M"
    });

    res.set("Cache-Control", "no-store");
    res.type("png").send(png);
  } catch (error) {
    console.error("Erreur QR:", error);
    res.status(500).send("Impossible de générer le QR code.");
  }
});

function broadcastState() {
  io.emit("state", {
    progress: Number(progress.toFixed(2)),
    totalBoosts,
    connectedUsers
  });
}

io.on("connection", (socket) => {
  connectedUsers++;
  broadcastState();

  socket.on("boost", () => {
    if (progress >= MAX_PROGRESS) return;

    progress = Math.min(MAX_PROGRESS, progress + BOOST_PER_TAP);
    totalBoosts++;
    broadcastState();

    io.emit("boostEffect", {
      id: Date.now() + Math.random(),
      totalBoosts
    });

    if (progress >= MAX_PROGRESS) {
      io.emit("completed");
    }
  });

  socket.on("reset", () => {
    progress = 0;
    totalBoosts = 0;
    broadcastState();
    io.emit("resetEffects");
  });

  socket.on("disconnect", () => {
    connectedUsers = Math.max(0, connectedUsers - 1);
    broadcastState();
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("");
  console.log("==============================================");
  console.log(" LIVE PROGRESS CROWD — COUP DE CŒUR 2026");
  console.log("==============================================");
  console.log(`Écran local  : http://localhost:${PORT}/screen.html`);
  console.log(`Téléphone LAN: http://${getLocalIPv4()}:${PORT}/phone.html`);
  console.log("En ligne     : URL détectée automatiquement");
  console.log("==============================================");
  console.log("");
});
