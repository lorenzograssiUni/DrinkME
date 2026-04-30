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

function cartaPath(nome) {
    return new URL(`../assets/images/cards/${nome}.png`, import.meta.url).href;
}

const REGOLE = [
    { carta: "2", testo: "Si for you — scegli chi beve" },
    { carta: "3", testo: "Si for me — beve chi pesca la carta" },
    { carta: "4", testo: "Vichingo — fai le corna (mare e remi), l'ultimo che lo fa beve" },
    { carta: "5", testo: "Specchio — ogni volta che bevi tu, beve anche chi ha ricevuto questa carta" },
    { carta: "6", testo: "Si for dicks — bevono i maschi" },
    { carta: "7", testo: "L'ultimo che alza la mano beve" },
    { carta: "8", testo: "Regola — inventa una regola per tutta la partita" },
    { carta: "9", testo: "Rima — di' una parola, si fa il giro: chi non rima beve" },
    { carta: "10", testo: "Categoria — scegli una categoria, si fa il giro: chi non trova beve" },
    { carta: "J", testo: "Non ho mai — di' qualcosa che non hai mai fatto, chi l'ha fatto beve" },
    { carta: "Q", testo: "Bevono le donne" },
    { carta: "K", testo: "Question Master — chi risponde senza fare una domanda beve" },
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

    const menuRef = useRef(null);

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
            if (card.split("-")[0] === "4") setVikingAttivo(true);
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
    }, [navigate, playerIndex, maxPlayers]);

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
                                    ? cardRevealed
                                        ? "Ricopri"
                                        : "Scopri"
                                    : "Non è il tuo turno"
                            }
                            style={{ opacity: !isMyTurn && !cardRevealed ? 0.6 : 1 }}
                        >
                            <img
                                src={cardRevealed && currentCard ? cartaPath(currentCard) : backPng}
                                alt={
                                    cardRevealed && currentCard
                                        ? `Carta ${currentCard}`
                                        : "Carta coperta"
                                }
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
                                <button className="aiuto-close" onClick={() => setAiuto(false)}>
                                    ✕
                                </button>
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
                                <button className="aiuto-close" onClick={() => setGiocatori(false)}>
                                    ✕
                                </button>
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

            {vikingAttivo && (
                <VikingAnimation
                    giocatore={nomeAttivo}
                    onClose={() => setVikingAttivo(false)}
                />
            )}

        </main>
    );
}