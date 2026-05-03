import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import "./Gioco.css";
import giocatoriSvg from "../assets/icons/giocatori.svg";
import aiutoSvg from "../assets/icons/aiuto.svg";
import menuSvg from "../assets/icons/menu.svg";
import backPng from "../assets/images/cards/back.png";
import beerPng from "../assets/images/beer.png";
import { socket } from "../socket";
import VikingAnimation from "../animations/VikingAnimation";
import MirrorAnimation from "../animations/MirrorAnimation";
import MattoAnimation from "../animations/MattoAnimation";
import SceltaAnimation from "../animations/SceltaAnimation";
import BeviAnimation from "../animations/BeviAnimation";

function cartaPath(nome) {
    return new URL(`../assets/images/cards/${nome}.png`, import.meta.url).href;
}

const REGOLE = [
    { carta: "2", testo: "Two is for you — Scegli chi beve." },
    { carta: "3", testo: "Three is for me — Beve chi pesca la carta." },
    { carta: "4", testo: "Vichingo — Chi pesca fa le corna, i giocatori ai lati remano, gli altri fanno le onde. L'ultimo che lo fa beve! Il vichingo resta finché qualcun altro pesca il 4." },
    { carta: "5", testo: "Specchio — Scegli un giocatore: ogni volta che bevi, beve anche lui. Si resetta quando qualcun altro pesca il 5." },
    { carta: "6", testo: "Six for dicks — Bevono i maschi." },
    { carta: "7", testo: "Bottone — Chi preme per ultimo il tasto beve!" },
    { carta: "8", testo: "Riposo — Questa volta nessuno beve, vi è andata bene!" },
    { carta: "9", testo: "Rima — Di' una parola, in senso orario ognuno dice una rima. Chi sbaglia o fa scadere il tempo beve!" },
    { carta: "10", testo: "Categoria — Scegli una categoria (es. marchi di auto, brand di vestiti…), in senso orario ognuno dice un elemento. Chi sbaglia o fa scadere il tempo beve!" },
    { carta: "J", testo: "Non ho mai — Chi ha almeno una volta compiuto l'azione che compare beve!" },
    { carta: "Q", testo: "Bevono le donne." },
    { carta: "K", testo: "Il Matto — Chi pesca il K fa domande durante la partita: chi risponde beve! Si resetta quando qualcun altro pesca il K." },
];

export default function Gioco() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        roomCode,
        playerIndex,
        isHost: initialIsHost,
        players: initialPlayers,
        currentPlayerIndex: initCPI,
        deckCount: initDeckCount,
        maxPlayers,
        currentCard: initialCurrentCard,
        cardRevealed: initialCardRevealed,
    } = location.state ?? {};

    const [players, setPlayers] = useState(initialPlayers ?? []);
    const [isHost, setIsHost] = useState(initialIsHost ?? false);
    const [currentPlayerIndex, setCPI] = useState(initCPI ?? 0);
    const [deckCount, setDeckCount] = useState(initDeckCount ?? 52);
    const [currentCard, setCurrentCard] = useState(initialCurrentCard ?? null);
    const [cardRevealed, setCardRevealed] = useState(initialCardRevealed ?? false);
    const [menuAperto, setMenuAperto] = useState(false);
    const [aiutoAperto, setAiuto] = useState(false);
    const [giocatoriAperti, setGiocatori] = useState(false);

    const [vikingAttivo, setVikingAttivo] = useState(false);
    const [vikingPlayerIndex, setVikingPlayerIndex] = useState(null);
    const [vikingPlayerName, setVikingPlayerName] = useState("");

    const [mirrorAttivo, setMirrorAttivo] = useState(false);
    const [mirrorPlayerName, setMirrorPlayerName] = useState("");

    const [mattoAttivo, setMattoAttivo] = useState(false);
    const [mattoPlayerName, setMattoPlayerName] = useState("");

    const [sceltaAttivo, setSceltaAttivo] = useState(false);
    const [sceltaPlayerName, setSceltaPlayerName] = useState("");

    const [beviAttivo, setBeviAttivo] = useState(false);
    const [beviPlayerName, setBeviPlayerName] = useState("");

    const menuRef = useRef(null);

    const playersRef = useRef(players);
    useEffect(() => { playersRef.current = players; }, [players]);

    const isMyTurn = playerIndex === currentPlayerIndex;
    const mazzoEsaurito = deckCount === 0 && !cardRevealed;
    const giocatoreAttivo = players[currentPlayerIndex];
    const nomeAttivo = giocatoreAttivo?.name || `Giocatore ${currentPlayerIndex + 1}`;

    useEffect(() => {
        const onCardDrawn = ({ card, deckCount: dc, currentPlayerIndex: cpi }) => {
            setCurrentCard(card);
            setCardRevealed(true);
            setDeckCount(dc);
            if (cpi !== undefined) setCPI(cpi);

            const valore = card.split("-")[0];
            const idx = cpi ?? 0;
            const chi = playersRef.current.find((p) => p.index === idx);
            const nome = chi?.name || `Giocatore ${idx + 1}`;

            console.log("[card-drawn] valore:", valore, "| idx:", idx, "| nome:", nome);

            if (valore === "2") {
                setSceltaPlayerName(nome);
                setSceltaAttivo(true);
            }

            if (valore === "3") {
                setBeviPlayerName(nome);
                setBeviAttivo(true);
            }

            if (valore === "4") {
                setVikingPlayerIndex(idx);
                setVikingPlayerName(nome);
                setVikingAttivo(true);
            }

            if (valore === "5") {
                setMirrorPlayerName(nome);
                setMirrorAttivo(true);
            }

            if (valore === "13") {
                setMattoPlayerName(nome);
                setMattoAttivo(true);
            }
        };

        const onTurnChanged = ({ currentPlayerIndex: cpi, deckCount: dc }) => {
            setCPI(cpi);
            setDeckCount(dc);
            setCardRevealed(false);
            setCurrentCard(null);
        };

        const onDeckShuffled = ({ deckCount: dc }) => {
            setDeckCount(dc);
            setCurrentCard(null);
            setCardRevealed(false);
        };

        const onPlayersUpdated = (updatedPlayers) => {
            setPlayers(updatedPlayers);
            const me = updatedPlayers.find((pl) => pl.index === playerIndex);
            setIsHost(Boolean(me?.isHost));
        };

        const onHostChanged = ({ hostPlayerIndex }) => {
            setIsHost(playerIndex === hostPlayerIndex);
        };

        const onGameRestarted = ({ roomCode: rc, maxPlayers: mp, players: p }) => {
            const me = p.find((pl) => pl.index === playerIndex);
            navigate("/attesa", {
                replace: true,
                state: {
                    roomCode: rc,
                    playerIndex,
                    maxPlayers: mp ?? maxPlayers,
                    isHost: Boolean(me?.isHost),
                },
            });
        };

        const onGameStateSync = ({
            roomCode: rc,
            playerIndex: pi,
            maxPlayers: mp,
            isHost: ih,
            players: p,
            currentPlayerIndex: cpi,
            deckCount: dc,
            currentCard: cc,
            cardRevealed: cr,
        }) => {
            setPlayers(p);
            setIsHost(ih);
            setCPI(cpi);
            setDeckCount(dc);
            setCurrentCard(cc);
            setCardRevealed(cr);

            navigate("/gioco", {
                replace: true,
                state: {
                    roomCode: rc,
                    playerIndex: pi,
                    maxPlayers: mp,
                    isHost: ih,
                    players: p,
                    currentPlayerIndex: cpi,
                    deckCount: dc,
                    currentCard: cc,
                    cardRevealed: cr,
                },
            });
        };

        socket.on("card-drawn", onCardDrawn);
        socket.on("turn-changed", onTurnChanged);
        socket.on("deck-shuffled", onDeckShuffled);
        socket.on("players-updated", onPlayersUpdated);
        socket.on("host-changed", onHostChanged);
        socket.on("game-restarted", onGameRestarted);
        socket.on("game-state-sync", onGameStateSync);

        return () => {
            socket.off("card-drawn", onCardDrawn);
            socket.off("turn-changed", onTurnChanged);
            socket.off("deck-shuffled", onDeckShuffled);
            socket.off("players-updated", onPlayersUpdated);
            socket.off("host-changed", onHostChanged);
            socket.off("game-restarted", onGameRestarted);
            socket.off("game-state-sync", onGameStateSync);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        function handleOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAperto(false);
            }
        }
        if (menuAperto) document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [menuAperto]);

    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") {
                setAiuto(false);
                setGiocatori(false);
                setMenuAperto(false);
            }
        }
        if (aiutoAperto || giocatoriAperti || menuAperto) {
            document.addEventListener("keydown", handleKey);
        }
        return () => document.removeEventListener("keydown", handleKey);
    }, [aiutoAperto, giocatoriAperti, menuAperto]);

    const handleClick = () => {
        if (!isMyTurn) return;
        if (!cardRevealed) {
            if (deckCount === 0) return;
            socket.emit("draw-card");
        } else {
            socket.emit("flip-card");
        }
    };

    const handleRimescola = () => {
        if (!isHost) return;
        socket.emit("shuffle-deck");
    };

    const handleRicomincia = () => {
        if (!isHost) return;
        setMenuAperto(false);
        socket.emit("restart-game");
    };

    const handleEsci = () => {
        setMenuAperto(false);
        socket.disconnect();
        navigate("/accesso", { replace: true });
    };

    return (
        <main className="gioco-page" aria-label="Schermata di gioco">
            <section className="gioco-screen">
                <nav className="gioco-nav">
                    <button
                        className="gioco-nav-btn gioco-nav-giocatori"
                        onClick={() => setGiocatori(true)}
                    >
                        <img src={giocatoriSvg} alt="" className="gioco-nav-icon" />
                        <span>Giocatori</span>
                    </button>

                    <div className="gioco-nav-right" ref={menuRef}>
                        <button
                            className="gioco-nav-icon-btn"
                            onClick={() => setAiuto(true)}
                            aria-label="Regole"
                        >
                            <img src={aiutoSvg} alt="" />
                        </button>

                        <button
                            className="gioco-nav-icon-btn"
                            aria-expanded={menuAperto}
                            onClick={() => setMenuAperto((v) => !v)}
                            aria-label="Menu"
                        >
                            <img src={menuSvg} alt="" />
                        </button>

                        {menuAperto && (
                            <div className="gioco-dropdown" role="menu">
                                <div className="gioco-dropdown-code">
                                    Codice stanza: {roomCode}
                                </div>

                                <div className="gioco-dropdown-divider" />

                                {isHost && (
                                    <>
                                        <button
                                            className="gioco-dropdown-item"
                                            role="menuitem"
                                            onClick={handleRicomincia}
                                        >
                                            🔄 Ricomincia partita
                                        </button>
                                        <div className="gioco-dropdown-divider" />
                                    </>
                                )}

                                <button
                                    className="gioco-dropdown-item gioco-dropdown-item--danger"
                                    role="menuitem"
                                    onClick={handleEsci}
                                >
                                    🚪 Esci dalla partita
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="gioco-card-section">
                    <div className="gioco-cards-badge" aria-live="polite">
                        Carte: {deckCount}
                    </div>

                    <div className="gioco-card-wrapper">
                        <button
                            className={`gioco-carta-btn ${cardRevealed ? "scoperta" : ""}`}
                            onClick={handleClick}
                            disabled={mazzoEsaurito || !isMyTurn}
                            aria-label={
                                isMyTurn
                                    ? cardRevealed ? "Ricopri" : "Scopri"
                                    : "Non è il tuo turno"
                            }
                            style={{ opacity: !isMyTurn && !cardRevealed ? 0.6 : 1 }}
                        >
                            <img
                                src={cardRevealed && currentCard ? cartaPath(currentCard) : backPng}
                                alt={cardRevealed && currentCard ? `Carta ${currentCard}` : "Carta coperta"}
                                className="gioco-carta-img"
                            />
                        </button>

                        {mazzoEsaurito && isHost && (
                            <div className="gioco-mazzo-esaurito">
                                <button
                                    className="gioco-rimescola-btn"
                                    onClick={handleRimescola}
                                >
                                    🔀 Rimescola il mazzo
                                </button>
                            </div>
                        )}

                        {mazzoEsaurito && !isHost && (
                            <div className="gioco-mazzo-esaurito">
                                <p className="gioco-attendi-rimescola">
                                    In attesa che l'host rimescoli...
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="gioco-player-card">
                    <div className="gioco-player-turno">Turno di</div>

                    <img
                        src={beerPng}
                        alt="Card giocatore"
                        className="gioco-beer-img"
                        draggable="false"
                    />

                    <span className="gioco-player-name">
                        {nomeAttivo.toUpperCase()}
                    </span>
                </div>

                {sceltaAttivo && (
                    <SceltaAnimation
                        giocatore={sceltaPlayerName}
                        onClose={() => setSceltaAttivo(false)}
                    />
                )}

                {beviAttivo && (
                    <BeviAnimation
                        giocatore={beviPlayerName}
                        onClose={() => setBeviAttivo(false)}
                    />
                )}

                {vikingAttivo && (
                    <VikingAnimation
                        giocatore={vikingPlayerName}
                        onClose={() => setVikingAttivo(false)}
                    />
                )}

                {mirrorAttivo && (
                    <MirrorAnimation
                        giocatore={mirrorPlayerName}
                        onClose={() => setMirrorAttivo(false)}
                    />
                )}

                {mattoAttivo && (
                    <MattoAnimation
                        giocatore={mattoPlayerName}
                        onClose={() => setMattoAttivo(false)}
                    />
                )}

            </section>

            {aiutoAperto &&
                createPortal(
                    <div
                        className="aiuto-overlay"
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setAiuto(false)}
                    >
                        <div className="aiuto-popup" onClick={(e) => e.stopPropagation()}>
                            <div className="aiuto-header">
                                <span className="aiuto-title">📖 REGOLE</span>
                                <button className="aiuto-close" onClick={() => setAiuto(false)}>✕</button>
                            </div>
                            <ol className="aiuto-list">
                                {REGOLE.map(({ carta, testo }) => (
                                    <li key={carta} className="aiuto-item">
                                        <span className="aiuto-carta">{carta}</span>
                                        <span className="aiuto-testo">{testo}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>,
                    document.body
                )}

            {giocatoriAperti &&
                createPortal(
                    <div
                        className="aiuto-overlay"
                        role="dialog"
                        aria-modal="true"
                        onClick={() => setGiocatori(false)}
                    >
                        <div className="aiuto-popup" onClick={(e) => e.stopPropagation()}>
                            <div className="aiuto-header">
                                <span className="aiuto-title">👥 GIOCATORI</span>
                                <button className="aiuto-close" onClick={() => setGiocatori(false)}>✕</button>
                            </div>
                            <ol className="aiuto-list">
                                {players.map((p) => (
                                    <li
                                        key={p.index}
                                        className={[
                                            "aiuto-item",
                                            p.index === currentPlayerIndex ? "aiuto-item--attivo" : "",
                                            p.connected === false ? "aiuto-item--disconnesso" : "",
                                        ].join(" ").trim()}
                                    >
                                        <span className="aiuto-carta">{p.index + 1}</span>
                                        <span className="aiuto-testo">
                                            {p.name || `Giocatore ${p.index + 1}`}
                                            {p.index === vikingPlayerIndex ? " ⚔️" : ""}
                                            {p.isHost ? " 👑" : ""}
                                            {p.index === playerIndex ? " (tu)" : ""}
                                            {p.connected === false ? " — disconnesso" : ""}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>,
                    document.body
                )}
        </main>
    );
}