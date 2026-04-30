import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.get("/health", (_, res) => res.json({ ok: true }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
    },
});

const rooms = new Map();

const SEMI = ["F", "P", "C", "Q"];
const VALORI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function creaMazzo() {
    const deck = SEMI.flatMap((s) => VALORI.map((v) => `${v}-${s}`));
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function generaCodice() {
    return String(Math.floor(10000 + Math.random() * 90000));
}

function getSafePlayers(players, hostSocketId) {
    return players.map((p) => ({
        ...p,
        isHost: p.socketId === hostSocketId && p.connected,
    }));
}

function getNextHost(room) {
    return room.players.find((p) => p.connected);
}

function getNextConnectedPlayerIndex(room, startIndex) {
    for (let i = 1; i <= room.players.length; i++) {
        const nextIndex = (startIndex + i) % room.players.length;
        if (room.players[nextIndex]?.connected) {
            return nextIndex;
        }
    }
    return startIndex;
}

io.on("connection", (socket) => {
    console.log("connect:", socket.id);

    socket.on("create-room", ({ numPlayers }, cb) => {
        let code;
        do {
            code = generaCodice();
        } while (rooms.has(code));

        const room = {
            code,
            hostSocketId: socket.id,
            maxPlayers: numPlayers,
            status: "waiting",
            players: [
                {
                    socketId: socket.id,
                    index: 0,
                    name: "",
                    gender: "female",
                    connected: true,
                },
            ],
            deck: [],
            currentCard: null,
            cardRevealed: false,
            currentPlayerIndex: 0,
        };

        rooms.set(code, room);
        socket.join(code);
        socket.data.roomCode = code;
        socket.data.playerIndex = 0;

        socket.emit("players-updated", getSafePlayers(room.players, room.hostSocketId));

        cb?.({
            ok: true,
            code,
            playerIndex: 0,
            maxPlayers: numPlayers,
            isHost: true,
            rejoined: false,
            inGame: false,
        });
    });

    socket.on("join-room", ({ code }, cb) => {
        const room = rooms.get(code);
        if (!room) {
            return cb?.({ ok: false, error: "Stanza non trovata" });
        }

        const disconnectedPlayer = room.players.find((p) => !p.connected);
        const connectedPlayers = room.players.filter((p) => p.connected);

        if (!disconnectedPlayer && connectedPlayers.length >= room.maxPlayers) {
            return cb?.({ ok: false, error: "Stanza piena" });
        }

        if (disconnectedPlayer) {
            disconnectedPlayer.socketId = socket.id;
            disconnectedPlayer.connected = true;

            socket.join(code);
            socket.data.roomCode = code;
            socket.data.playerIndex = disconnectedPlayer.index;

            io.to(code).emit("players-updated", getSafePlayers(room.players, room.hostSocketId));

            if (room.status === "playing") {
                socket.emit("game-state-sync", {
                    roomCode: room.code,
                    playerIndex: disconnectedPlayer.index,
                    maxPlayers: room.maxPlayers,
                    isHost: room.hostSocketId === socket.id,
                    players: getSafePlayers(room.players, room.hostSocketId),
                    currentPlayerIndex: room.currentPlayerIndex,
                    deckCount: room.deck.length,
                    currentCard: room.currentCard,
                    cardRevealed: room.cardRevealed,
                });
            }

            return cb?.({
                ok: true,
                playerIndex: disconnectedPlayer.index,
                maxPlayers: room.maxPlayers,
                isHost: room.hostSocketId === socket.id,
                rejoined: true,
                inGame: room.status === "playing",
            });
        }

        if (room.status !== "waiting") {
            return cb?.({ ok: false, error: "Partita già iniziata" });
        }

        const index = room.players.length;
        room.players.push({
            socketId: socket.id,
            index,
            name: "",
            gender: index % 2 === 0 ? "female" : "male",
            connected: true,
        });

        socket.join(code);
        socket.data.roomCode = code;
        socket.data.playerIndex = index;

        io.to(code).emit("players-updated", getSafePlayers(room.players, room.hostSocketId));

        cb?.({
            ok: true,
            playerIndex: index,
            maxPlayers: room.maxPlayers,
            isHost: false,
            rejoined: false,
            inGame: false,
        });
    });

    socket.on("get-players", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        cb?.(room ? getSafePlayers(room.players, room.hostSocketId) : null);
    });

    socket.on("update-player", ({ name, gender }, cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return cb?.({ ok: false });

        const player = room.players.find((p) => p.socketId === socket.id);
        if (!player) return cb?.({ ok: false });

        if (name !== undefined) player.name = name;
        if (gender !== undefined) player.gender = gender;

        io.to(room.code).emit("players-updated", getSafePlayers(room.players, room.hostSocketId));
        cb?.({ ok: true });
    });

    socket.on("start-game", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return cb?.({ ok: false, error: "Stanza non trovata" });
        if (room.hostSocketId !== socket.id) return cb?.({ ok: false, error: "Solo l'host può avviare" });

        room.status = "playing";
        room.deck = creaMazzo();
        room.currentCard = null;
        room.cardRevealed = false;

        const firstConnected = room.players.find((p) => p.connected);
        room.currentPlayerIndex = firstConnected ? firstConnected.index : 0;

        io.to(room.code).emit("game-started", {
            deck: room.deck,
            players: getSafePlayers(room.players, room.hostSocketId),
            currentPlayerIndex: room.currentPlayerIndex,
            hostSocketId: room.hostSocketId,
        });

        cb?.({ ok: true });
    });

    socket.on("draw-card", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.status !== "playing") {
            return cb?.({ ok: false, error: "Partita non attiva" });
        }
        if (socket.data.playerIndex !== room.currentPlayerIndex) {
            return cb?.({ ok: false, error: "Non è il tuo turno" });
        }
        if (room.cardRevealed) {
            return cb?.({ ok: false, error: "Carta già pescata" });
        }
        if (room.deck.length === 0) {
            return cb?.({ ok: false, error: "Mazzo esaurito" });
        }

        const idx = Math.floor(Math.random() * room.deck.length);
        const card = room.deck.splice(idx, 1)[0];

        room.currentCard = card;
        room.cardRevealed = true;

        io.to(room.code).emit("card-drawn", {
            card,
            deckCount: room.deck.length,
            currentPlayerIndex: room.currentPlayerIndex,
        });

        cb?.({ ok: true });
    });

    socket.on("flip-card", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room || room.status !== "playing") {
            return cb?.({ ok: false, error: "Partita non attiva" });
        }
        if (socket.data.playerIndex !== room.currentPlayerIndex) {
            return cb?.({ ok: false, error: "Non è il tuo turno" });
        }
        if (!room.cardRevealed) {
            return cb?.({ ok: false, error: "Nessuna carta da girare" });
        }

        const connectedPlayers = room.players.filter((p) => p.connected);
        if (connectedPlayers.length === 0) {
            return cb?.({ ok: false, error: "Nessun giocatore connesso" });
        }

        room.cardRevealed = false;
        room.currentCard = null;
        room.currentPlayerIndex = getNextConnectedPlayerIndex(room, room.currentPlayerIndex);

        io.to(room.code).emit("turn-changed", {
            currentPlayerIndex: room.currentPlayerIndex,
            deckCount: room.deck.length,
        });

        cb?.({ ok: true });
    });

    socket.on("shuffle-deck", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return cb?.({ ok: false, error: "Stanza non trovata" });
        if (room.hostSocketId !== socket.id) {
            return cb?.({ ok: false, error: "Solo l'host può rimescolare" });
        }

        room.deck = creaMazzo();
        room.currentCard = null;
        room.cardRevealed = false;

        io.to(room.code).emit("deck-shuffled", {
            deckCount: room.deck.length,
            hostSocketId: room.hostSocketId,
        });

        cb?.({ ok: true });
    });

    socket.on("restart-game", (cb) => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return cb?.({ ok: false, error: "Stanza non trovata" });
        if (room.hostSocketId !== socket.id) {
            return cb?.({ ok: false, error: "Solo l'host può ricominciare" });
        }

        room.status = "waiting";
        room.deck = [];
        room.currentCard = null;
        room.cardRevealed = false;
        room.currentPlayerIndex = 0;

        io.to(room.code).emit("game-restarted", {
            roomCode: room.code,
            maxPlayers: room.maxPlayers,
            hostSocketId: room.hostSocketId,
            players: getSafePlayers(room.players, room.hostSocketId),
        });

        io.to(room.code).emit("players-updated", getSafePlayers(room.players, room.hostSocketId));

        cb?.({ ok: true });
    });

    socket.on("disconnect", () => {
        const room = rooms.get(socket.data.roomCode);
        if (!room) return;

        const player = room.players.find((p) => p.socketId === socket.id);
        if (!player) return;

        player.connected = false;

        const hostWasDisconnected = room.hostSocketId === socket.id;

        if (hostWasDisconnected) {
            const nextHost = getNextHost(room);
            if (nextHost) {
                room.hostSocketId = nextHost.socketId;
                io.to(room.code).emit("host-changed", {
                    hostSocketId: room.hostSocketId,
                    hostPlayerIndex: nextHost.index,
                });
            }
        }

        if (room.status === "playing" && room.currentPlayerIndex === player.index) {
            const stillConnected = room.players.some((p) => p.connected);

            if (stillConnected) {
                room.currentPlayerIndex = getNextConnectedPlayerIndex(room, player.index);
                room.cardRevealed = false;
                room.currentCard = null;

                io.to(room.code).emit("turn-changed", {
                    currentPlayerIndex: room.currentPlayerIndex,
                    deckCount: room.deck.length,
                });
            }
        }

        io.to(room.code).emit("players-updated", getSafePlayers(room.players, room.hostSocketId));

        if (room.players.every((p) => !p.connected)) {
            rooms.delete(room.code);
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`DrinkME server on :${PORT}`);
});