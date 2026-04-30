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
    const { roomCode, playerIndex, maxPlayers, isHost, mode } = location.state ?? {};

    const [players, setPlayers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editingVal, setEditingVal] = useState("");
    const inputRef = useRef(null);

    // ── Socket listeners ──────────────────────────────────────────────────────
    useEffect(() => {
        const onPlayersUpdated = (updatedPlayers) => setPlayers(updatedPlayers);

        const onGameStarted = ({ players: p, currentPlayerIndex, deck }) => {
            navigate("/gioco", {
                state: {
                    roomCode,
                    playerIndex,
                    isHost,
                    players: p,
                    currentPlayerIndex,
                    deckCount: deck.length,
                },
            });
        };

        socket.on("players-updated", onPlayersUpdated);
        socket.on("game-started", onGameStarted);

        // Richiedi la lista corrente (host la ha già, guest la riceve via players-updated)
        return () => {
            socket.off("players-updated", onPlayersUpdated);
            socket.off("game-started", onGameStarted);
        };
    }, [navigate, roomCode, playerIndex, isHost]);

    // ── Autofocus input ───────────────────────────────────────────────────────
    useEffect(() => {
        if (editingId !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const toggleAvatar = (player) => {
        if (player.index !== playerIndex) return; // solo il tuo avatar
        const newGender = player.gender === "female" ? "male" : "female";
        socket.emit("update-player", { gender: newGender });
    };

    const startEdit = (player) => {
        if (player.index !== playerIndex) return; // solo il tuo nome
        setEditingId(player.index);
        setEditingVal(player.name);
    };

    const commitEdit = () => {
        const trimmed = editingVal.trim().toUpperCase();
        socket.emit("update-player", { name: trimmed });
        setEditingId(null);
        setEditingVal("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") commitEdit();
        if (e.key === "Escape") { setEditingId(null); setEditingVal(""); }
    };

    const handleIniziaGioco = () => {
        socket.emit("start-game");
    };

    const handleAnnulla = () => {
        socket.disconnect();
        navigate(mode === "join" ? "/unisciti" : "/crea-partita");
    };

    // ── Slot vuoti (giocatori non ancora connessi) ────────────────────────────
    const slotList = Array.from({ length: maxPlayers ?? 6 }, (_, i) => {
        return players.find(p => p.index === i) ?? { index: i, name: "", gender: i % 2 === 0 ? "female" : "male", connected: false, empty: true };
    });

    const connectedCount = players.filter(p => p.connected).length;
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

                                return (
                                    <li
                                        key={player.index}
                                        className={`attesa-player ${isEmpty ? "attesa-player--empty" : ""} ${!player.connected && !isEmpty ? "attesa-player--disconnected" : ""}`}
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
                                                    className={`attesa-player-name ${isMine ? "attesa-player-name--editable" : ""} ${!player.name ? "attesa-player-name--placeholder" : ""}`}
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