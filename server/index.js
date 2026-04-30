import express    from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.get("/health", (_, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] },
});

// ── Struttura stanza ──────────────────────────────────────────────────────────
// {
//   code, hostSocketId, maxPlayers, status: "waiting"|"playing",
//   players: [{ socketId, index, name, gender, connected }],
//   deck: [], currentCard: null, cardRevealed: false, currentPlayerIndex: 0
// }
const rooms = new Map();

const SEMI   = ["F", "P", "C", "Q"];
const VALORI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function creaMazzo() {
    const deck = SEMI.flatMap(s => VALORI.map(v => `${v}-${s}`));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function generaCodice() {
    return String(Math.floor(10000 + Math.random() * 90000));
}

// ── Socket events ─────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
    console.log("connect:", socket.id);

    // ── Crea stanza ──
    socket.on("create-room", ({ numPlayers }, cb) => {
        let code;
        do { code = generaCodice(); } while (rooms.has(code));

        const room = {
            code,
            hostSocketId: socket.id,
            maxPlayers: numPlayers,
            status: "waiting",
            players: [{
                socketId: socket.id,
                index: 0,
                name: "",
                gender: "female",
                connected: true,
            }],
            deck: [],
            currentCard: null,
            cardRevealed: false,
            currentPlayerIndex: 0,
        };
        rooms.set(code, room);
        socket.join(code);
        socket.data.roomCode   = code;
        socket.data.playerIndex = 0;
        // Notifica subito l'host con la lista iniziale
        socket.emit("players-updated", room.players);
        cb({ ok: true, code, playerIndex: 0, maxPlayers: numPlayers });
    });

    // ── Unisciti alla stanza ──
    socket.on("join-room", ({ code }, cb) => {
        const room = rooms.get(code);
        if (!room)                                  return cb({ ok: false, error: "Stanza non trovata" });
        if (room.status !== "waiting")              return cb({ ok: false, error: "Partita già iniziata" });
        if (room.players.length >= room.maxPlayers) return cb({ ok: false, error: "Stanza piena" });

        const index = room.players.length;
        room.players.push({
            socketId: socket.id,
            index,
            name: "",
            gender: index % 2 === 0 ? "female" : "male",
            connected: true,
        });
        socket.join(code);
        socket.data.roomCode   = code;
        socket.data.playerIndex = index;
        io.to(code).emit("players-updated", room.players);
        cb({ ok: true, playerIndex: index, maxPlayers: room.maxPlayers });
    });

    // ── Lista giocatori corrente (per mount/refresh) ──
    socket.on("get-players", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (cb) cb(room ? room.players : null);
    });

    // ── Aggiorna nome/genere ──
    socket.on("update-player", ({ name, gender }) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player) return;
        if (name   !== undefined) player.name   = name;
        if (gender !== undefined) player.gender = gender;
        io.to(room.code).emit("players-updated", room.players);
    });

    // ── Inizia partita (solo host) ──
    socket.on("start-game", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.hostSocketId !== socket.id) return;
        room.status = "playing";
        room.deck = creaMazzo();
        room.currentCard = null;
        room.cardRevealed = false;
        room.currentPlayerIndex = 0;
        io.to(room.code).emit("game-started", {
            deck:               room.deck,
            players:            room.players,
            currentPlayerIndex: 0,
        });
        if (cb) cb({ ok: true });
    });

    // ── Pesca carta ──
    socket.on("draw-card", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.status !== "playing")                  return;
        if (socket.data.playerIndex !== room.currentPlayerIndex) return;
        if (room.cardRevealed || room.deck.length === 0)         return;

        const idx  = Math.floor(Math.random() * room.deck.length);
        const card = room.deck.splice(idx, 1)[0];
        room.currentCard  = card;
        room.cardRevealed = true;
        io.to(room.code).emit("card-drawn", {
            card,
            deckCount:          room.deck.length,
            currentPlayerIndex: room.currentPlayerIndex,
        });
        if (cb) cb({ ok: true });
    });

    // ── Ricopri carta (fine turno) ──
    socket.on("flip-card", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.status !== "playing")                  return;
        if (socket.data.playerIndex !== room.currentPlayerIndex) return;
        if (!room.cardRevealed)                                  return;

        room.cardRevealed = false;
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        io.to(room.code).emit("turn-changed", {
            currentPlayerIndex: room.currentPlayerIndex,
            deckCount:          room.deck.length,
        });
        if (cb) cb({ ok: true });
    });

    // ── Rimescola mazzo ──
    socket.on("shuffle-deck", () => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || socket.data.playerIndex !== room.currentPlayerIndex) return;
        room.deck         = creaMazzo();
        room.currentCard  = null;
        room.cardRevealed = false;
        io.to(room.code).emit("deck-shuffled", { deckCount: room.deck.length });
    });

    // ── Disconnect ──
    socket.on("disconnect", () => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return;
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) player.connected = false;
        io.to(room.code).emit("players-updated", room.players);
        if (room.players.every(p => !p.connected)) rooms.delete(room.code);
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`DrinkME server on :${PORT}`));
