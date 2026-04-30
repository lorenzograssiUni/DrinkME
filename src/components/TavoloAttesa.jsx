import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TavoloAttesa.css";
import avatarFemale from "../assets/avatars/avatar-female.png";
import avatarMale from "../assets/avatars/avatar-male.png";
import frecceSvg from "../assets/icons/frecce.svg";
import genderSvg from "../assets/icons/gender.svg";
import { socket } from "../socket";

const PLACEHOLDER = "INSERISCI NOME";

export default function TavoloAttesa() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        roomCode,
        playerIndex,
        maxPlayers,
        isHost: initialIsHost,
    } = location.state ?? {};

    const [players, setPlayers] = useState([]);
    const [isHost, setIsHost] = useState(initialIsHost ?? false);
    const [editingId, setEditingId] = useState(null);
    const [editingVal, setEditingVal] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        const onPlayersUpdated = (updatedPlayers) => {
            setPlayers(updatedPlayers);
            const me = updatedPlayers.find((p) => p.index === playerIndex);
            setIsHost(Boolean(me?.isHost));
        };

        const onHostChanged = ({ hostPlayerIndex }) => {
            setIsHost(playerIndex === hostPlayerIndex);
        };

        const onGameStarted = ({ players: p, currentPlayerIndex, deck, hostSocketId }) => {
            const me = p.find((pl) => pl.index === playerIndex);

            navigate("/gioco", {
                replace: true,
                state: {
                    roomCode,
                    playerIndex,
                    maxPlayers,
                    isHost: Boolean(me?.isHost),
                    players: p,
                    currentPlayerIndex,
                    deckCount: deck.length,
                    currentCard: null,
                    cardRevealed: false,
                    hostSocketId,
                },
            });
        };

        socket.on("players-updated", onPlayersUpdated);
        socket.on("host-changed", onHostChanged);
        socket.on("game-started", onGameStarted);

        socket.emit("get-players", (current) => {
            if (current) {
                setPlayers(current);
                const me = current.find((p) => p.index === playerIndex);
                setIsHost(Boolean(me?.isHost));
            }
        });

        return () => {
            socket.off("players-updated", onPlayersUpdated);
            socket.off("host-changed", onHostChanged);
            socket.off("game-started", onGameStarted);
        };
    }, [navigate, roomCode, playerIndex, maxPlayers]);

    useEffect(() => {
        if (editingId !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const toggleAvatar = (player) => {
        if (player.index !== playerIndex) return;

        socket.emit("update-player", {
            gender: player.gender === "female" ? "male" : "female",
        });
    };

    const startEdit = (player) => {
        if (player.index !== playerIndex) return;
        setEditingId(player.index);
        setEditingVal(player.name);
    };

    const commitEdit = () => {
        socket.emit("update-player", {
            name: editingVal.trim().toUpperCase(),
        });
        setEditingId(null);
        setEditingVal("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") commitEdit();
        if (e.key === "Escape") {
            setEditingId(null);
            setEditingVal("");
        }
    };

    const handleIniziaGioco = () => {
        socket.emit("start-game");
    };

    const handleAnnulla = () => {
        socket.disconnect();
        navigate("/accesso", { replace: true });
    };

    const nextIndex = players.length;
    const isFull = nextIndex >= (maxPlayers ?? 6);

    const slotList = [
        ...players,
        ...(!isFull
            ? [
                {
                    index: nextIndex,
                    name: "",
                    gender: nextIndex % 2 === 0 ? "female" : "male",
                    connected: false,
                    empty: true,
                },
            ]
            : []),
    ];

    const connectedCount = players.filter((p) => p.connected).length;
    const canStart = isHost && connectedCount >= 2;

    return (
        <main className="attesa-page" aria-label="Tavolo di attesa">
            <section className="attesa-screen">
                <div className="attesa-panel">
                    <div className="attesa-panel-inner">
                        <div className="attesa-code">
                            <span>Code: {roomCode ?? "—"}</span>
                        </div>

                        <div className="attesa-icons-card">
                            <img src={frecceSvg} alt="frecce" className="attesa-icon" />
                            <img src={genderSvg} alt="gender" className="attesa-icon" />
                        </div>

                        <ol className="attesa-list" aria-label="Giocatori in attesa">
                            {slotList.map((player) => {
                                const isMine = player.index === playerIndex;
                                const isEmpty = player.empty;
                                const isCreatore = player.isHost && !isEmpty;

                                return (
                                    <li
                                        key={player.index}
                                        className={[
                                            "attesa-player",
                                            isEmpty ? "attesa-player--empty" : "",
                                            !player.connected && !isEmpty ? "attesa-player--disconnected" : "",
                                        ].join(" ").trim()}
                                    >
                                        <button
                                            className="attesa-avatar-btn"
                                            onClick={() => toggleAvatar(player)}
                                            disabled={!isMine || isEmpty}
                                            aria-label={`Cambia avatar Giocatore ${player.index + 1}`}
                                        >
                                            <img
                                                src={player.gender === "female" ? avatarFemale : avatarMale}
                                                alt={player.gender}
                                                className="attesa-avatar"
                                                style={{ opacity: isEmpty ? 0.3 : 1 }}
                                            />
                                        </button>

                                        <div className="attesa-player-info">
                                            <span className="attesa-player-label">
                                                Giocatore {player.index + 1}
                                                {isCreatore && <span className="attesa-host-badge">HOST</span>}
                                                {!isEmpty && !player.connected && " — disconnesso"}
                                            </span>

                                            {isEmpty ? (
                                                <span className="attesa-player-name attesa-player-name--placeholder">
                                                    In attesa...
                                                </span>
                                            ) : editingId === player.index ? (
                                                <input
                                                    ref={inputRef}
                                                    className="attesa-player-name-input"
                                                    value={editingVal}
                                                    onChange={(e) => setEditingVal(e.target.value)}
                                                    onBlur={commitEdit}
                                                    onKeyDown={handleKeyDown}
                                                    maxLength={16}
                                                />
                                            ) : (
                                                <span
                                                    className={[
                                                        "attesa-player-name",
                                                        isMine ? "attesa-player-name--editable" : "",
                                                        !player.name ? "attesa-player-name--placeholder" : "",
                                                    ].join(" ").trim()}
                                                    onClick={() => startEdit(player)}
                                                    role={isMine ? "button" : undefined}
                                                    tabIndex={isMine ? 0 : undefined}
                                                    onKeyDown={(e) => e.key === "Enter" && startEdit(player)}
                                                >
                                                    {player.name || PLACEHOLDER}
                                                </span>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ol>
                    </div>
                </div>

                <div className="attesa-actions">
                    {isHost ? (
                        <button
                            className="attesa-btn attesa-btn--gioca"
                            type="button"
                            disabled={!canStart}
                            onClick={handleIniziaGioco}
                            style={{ opacity: canStart ? 1 : 0.5 }}
                        >
                            INIZIA
                        </button>
                    ) : (
                        <div className="attesa-waiting-msg">
                            In attesa dell'host...
                        </div>
                    )}

                    <button
                        className="attesa-btn attesa-btn--annulla"
                        type="button"
                        onClick={handleAnnulla}
                    >
                        ANNULLA
                    </button>
                </div>
            </section>
        </main>
    );
}