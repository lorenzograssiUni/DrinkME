import express from "express";
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

const rooms = new Map();
const SEMI = ["F", "P", "C", "Q"];
const VALORI = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const REGOLA_TO_VALORE = { "2":"2","3":"3","4":"4","5":"5","6":"6","7":"7","8":"8","9":"9","10":"10","J":"11","Q":"12","K":"13" };

function creaMazzo() {
    const deck = SEMI.flatMap(s => VALORI.map(v => `${v}-${s}`));
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    return deck;
}
function generaCodice() { return String(Math.floor(10000+Math.random()*90000)); }
function safe(players, hostId) { return players.map(p => ({...p, isHost: p.socketId===hostId && p.connected})); }
function nextHost(room) { return room.players.find(p => p.connected); }
function nextIdx(room, from) {
    for (let i=1; i<=room.players.length; i++) { const n=(from+i)%room.players.length; if(room.players[n]?.connected) return n; }
    return from;
}

io.on("connection", socket => {
    console.log("connect:", socket.id);

    socket.on("create-room", ({numPlayers}, cb) => {
        let code; do { code=generaCodice(); } while(rooms.has(code));
        const room = { code, hostSocketId:socket.id, maxPlayers:numPlayers, status:"waiting",
            players:[{socketId:socket.id,index:0,name:"",gender:"female",connected:true}],
            deck:[], currentCard:null, cardRevealed:false, currentPlayerIndex:0, buttonGame:null };
        rooms.set(code, room); socket.join(code); socket.data.roomCode=code; socket.data.playerIndex=0;
        socket.emit("players-updated", safe(room.players, room.hostSocketId));
        cb?.({ok:true,code,playerIndex:0,maxPlayers:numPlayers,isHost:true,rejoined:false,inGame:false});
    });

    socket.on("join-room", ({code}, cb) => {
        const room = rooms.get(code);
        if (!room) return cb?.({ok:false,error:"Stanza non trovata"});
        const disc = room.players.find(p => !p.connected);
        const conn = room.players.filter(p => p.connected);
        if (!disc && conn.length >= room.maxPlayers) return cb?.({ok:false,error:"Stanza piena"});
        if (disc) {
            disc.socketId=socket.id; disc.connected=true;
            socket.join(code); socket.data.roomCode=code; socket.data.playerIndex=disc.index;
            io.to(code).emit("players-updated", safe(room.players, room.hostSocketId));
            if (room.status==="playing") socket.emit("game-state-sync", {
                roomCode:room.code, playerIndex:disc.index, maxPlayers:room.maxPlayers,
                isHost:room.hostSocketId===socket.id, players:safe(room.players,room.hostSocketId),
                currentPlayerIndex:room.currentPlayerIndex, deckCount:room.deck.length,
                currentCard:room.currentCard, cardRevealed:room.cardRevealed });
            return cb?.({ok:true,playerIndex:disc.index,maxPlayers:room.maxPlayers,isHost:room.hostSocketId===socket.id,rejoined:true,inGame:room.status==="playing"});
        }
        if (room.status!=="waiting") return cb?.({ok:false,error:"Partita già iniziata"});
        const index = room.players.length;
        room.players.push({socketId:socket.id,index,name:"",gender:index%2===0?"female":"male",connected:true});
        socket.join(code); socket.data.roomCode=code; socket.data.playerIndex=index;
        io.to(code).emit("players-updated", safe(room.players, room.hostSocketId));
        cb?.({ok:true,playerIndex:index,maxPlayers:room.maxPlayers,isHost:false,rejoined:false,inGame:false});
    });

    socket.on("get-players", cb => { const r=rooms.get(socket.data.roomCode); cb?.(r?safe(r.players,r.hostSocketId):null); });

    socket.on("update-player", ({name,gender},cb) => {
        const room=rooms.get(socket.data.roomCode); if(!room) return cb?.({ok:false});
        const p=room.players.find(p=>p.socketId===socket.id); if(!p) return cb?.({ok:false});
        if(name!==undefined) p.name=name; if(gender!==undefined) p.gender=gender;
        io.to(room.code).emit("players-updated",safe(room.players,room.hostSocketId)); cb?.({ok:true});
    });

    socket.on("start-game", cb => {
        const room=rooms.get(socket.data.roomCode);
        if(!room) return cb?.({ok:false,error:"Stanza non trovata"});
        if(room.hostSocketId!==socket.id) return cb?.({ok:false,error:"Solo l'host può avviare"});
        room.status="playing"; room.deck=creaMazzo(); room.currentCard=null; room.cardRevealed=false; room.buttonGame=null;
        const first=room.players.find(p=>p.connected); room.currentPlayerIndex=first?first.index:0;
        io.to(room.code).emit("game-started",{deck:room.deck,players:safe(room.players,room.hostSocketId),currentPlayerIndex:room.currentPlayerIndex,hostSocketId:room.hostSocketId});
        cb?.({ok:true});
    });

    // Dev mode / debug: forza una carta e, se è un 7, avvia subito il mini-gioco bottone
    socket.on("force-card", ({valore}, cb) => {
        const room=rooms.get(socket.data.roomCode);
        if(!room||room.status!=="playing") return cb?.({ok:false,error:"Partita non attiva"});
        if(room.cardRevealed) return cb?.({ok:false,error:"Carta già scoperta"});

        const val = REGOLA_TO_VALORE[valore] ?? valore;
        let idx = room.deck.findIndex(c => c === `${val}-P`);
        if (idx === -1) idx = room.deck.findIndex(c => c.startsWith(`${val}-`));
        if (idx === -1) return cb?.({ok:false,error:"Carta non trovata nel mazzo"});

        const [card] = room.deck.splice(idx, 1);
        room.currentCard = card;
        room.cardRevealed = true;

        let buttonDelay = null;
        if (card.startsWith("7-")) {
            const total = room.players.filter(p => p.connected).length;
            buttonDelay = Math.floor(Math.random()*9000)+1000;
            room.buttonGame = {pressed:[],total,started:Date.now(),delay:buttonDelay};
            // subito broadcast dello stato iniziale 0/total, così il client non mostra 0/?
            io.to(room.code).emit("button-pressed", { pressedCount: 0, total, pressedIndices: [] });
        }

        io.to(room.code).emit("card-drawn", {
            card,
            deckCount: room.deck.length,
            currentPlayerIndex: room.currentPlayerIndex,
            buttonDelay,
        });

        cb?.({ok:true, card});
    });

    socket.on("draw-card", cb => {
        const room=rooms.get(socket.data.roomCode);
        if(!room||room.status!=="playing") return cb?.({ok:false,error:"Partita non attiva"});
        if(socket.data.playerIndex!==room.currentPlayerIndex) return cb?.({ok:false,error:"Non è il tuo turno"});
        if(room.cardRevealed) return cb?.({ok:false,error:"Carta già pescata"});
        if(room.deck.length===0) return cb?.({ok:false,error:"Mazzo esaurito"});

        const card=room.deck.shift();
        room.currentCard=card;
        room.cardRevealed=true;

        let buttonDelay=null;
        if(card.startsWith("7-")) {
            const total=room.players.filter(p=>p.connected).length;
            buttonDelay=Math.floor(Math.random()*9000)+1000;
            room.buttonGame={pressed:[],total,started:Date.now(),delay:buttonDelay};
            io.to(room.code).emit("button-pressed", { pressedCount: 0, total, pressedIndices: [] });
        }

        io.to(room.code).emit("card-drawn",{card,deckCount:room.deck.length,currentPlayerIndex:room.currentPlayerIndex,buttonDelay});
        cb?.({ok:true});
    });

    socket.on("press-button", cb => {
        const room=rooms.get(socket.data.roomCode);
        if(!room||!room.buttonGame) return cb?.({ok:false,error:"Nessun gioco attivo"});

        // Recupera in modo robusto l'indice del giocatore
        let pi = socket.data.playerIndex;
        if (pi === undefined || pi === null) {
            const player = room.players.find(p => p.socketId === socket.id);
            if (!player) {
                return cb?.({ ok:false, error:"Giocatore non trovato" });
            }
            pi = player.index;
            socket.data.playerIndex = pi;
        }

        if(room.buttonGame.pressed.includes(pi)) return cb?.({ok:false,error:"Già premuto"});
        room.buttonGame.pressed.push(pi);
        const {pressed,total}=room.buttonGame;
        io.to(room.code).emit("button-pressed",{pressedCount:pressed.length,total,pressedIndices:pressed});
        if(pressed.length>=total) {
            const loserPlayer=room.players.find(p=>p.index===pi);
            const loserName=loserPlayer?.name||`Giocatore ${pi+1}`;
            io.to(room.code).emit("button-loser",{loserIndex:pi,loserName});
            room.buttonGame=null;
        }
        cb?.({ok:true});
    });

    socket.on("flip-card", cb => {
        const room=rooms.get(socket.data.roomCode);
        if(!room||room.status!=="playing") return cb?.({ok:false,error:"Partita non attiva"});
        if(socket.data.playerIndex!==room.currentPlayerIndex) return cb?.({ok:false,error:"Non è il tuo turno"});
        if(!room.cardRevealed) return cb?.({ok:false,error:"Nessuna carta da girare"});
        room.buttonGame=null; room.cardRevealed=false; room.currentCard=null;
        room.currentPlayerIndex=nextIdx(room,room.currentPlayerIndex);
        io.to(room.code).emit("turn-changed",{currentPlayerIndex:room.currentPlayerIndex,deckCount:room.deck.length});
        cb?.({ok:true});
    });

    socket.on("shuffle-deck", cb => {
        const room=rooms.get(socket.data.roomCode);
        if(!room) return cb?.({ok:false}); if(room.hostSocketId!==socket.id) return cb?.({ok:false});
        room.buttonGame=null; room.deck=creaMazzo(); room.currentCard=null; room.cardRevealed=false;
        io.to(room.code).emit("deck-shuffled",{deckCount:room.deck.length,hostSocketId:room.hostSocketId}); cb?.({ok:true});
    });

    socket.on("restart-game", cb => {
        const room=rooms.get(socket.data.roomCode);
        if(!room) return cb?.({ok:false}); if(room.hostSocketId!==socket.id) return cb?.({ok:false});
        room.buttonGame=null; room.status="waiting"; room.deck=[]; room.currentCard=null; room.cardRevealed=false; room.currentPlayerIndex=0;
        io.to(room.code).emit("game-restarted",{roomCode:room.code,maxPlayers:room.maxPlayers,hostSocketId:room.hostSocketId,players:safe(room.players,room.hostSocketId)});
        io.to(room.code).emit("players-updated",safe(room.players,room.hostSocketId)); cb?.({ok:true});
    });

    socket.on("disconnect", () => {
        const room=rooms.get(socket.data.roomCode); if(!room) return;
        const player=room.players.find(p=>p.socketId===socket.id); if(!player) return;
        player.connected=false;
        if(room.buttonGame&&!room.buttonGame.pressed.includes(player.index)) {
            room.buttonGame.total=Math.max(1,room.buttonGame.total-1);
            if(room.buttonGame.pressed.length>=room.buttonGame.total) {
                const li=room.buttonGame.pressed[room.buttonGame.pressed.length-1];
                const lp=room.players.find(p=>p.index===li);
                io.to(room.code).emit("button-loser",{loserIndex:li,loserName:lp?.name||`Giocatore ${li+1}`});
                room.buttonGame=null;
            }
        }
        if(room.hostSocketId===socket.id) { const nh=nextHost(room); if(nh) { room.hostSocketId=nh.socketId; io.to(room.code).emit("host-changed",{hostSocketId:room.hostSocketId,hostPlayerIndex:nh.index}); } }
        if(room.status==="playing"&&room.currentPlayerIndex===player.index&&room.players.some(p=>p.connected)) {
            room.currentPlayerIndex=nextIdx(room,player.index); room.cardRevealed=false; room.currentCard=null;
            io.to(room.code).emit("turn-changed",{currentPlayerIndex:room.currentPlayerIndex,deckCount:room.deck.length});
        }
        io.to(room.code).emit("players-updated",safe(room.players,room.hostSocketId));
        if(room.players.every(p=>!p.connected)) rooms.delete(room.code);
    });
});

const PORT=process.env.PORT||3001;
httpServer.listen(PORT,()=>console.log(`DrinkME server on :${PORT}`));
