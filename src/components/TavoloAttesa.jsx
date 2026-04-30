import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TavoloAttesa.css";
import avatarFemale from "../assets/avatars/avatar-female.png";
import avatarMale from "../assets/avatars/avatar-male.png";
import frecceSvg from "../assets/icons/frecce.svg";
import genderSvg from "../assets/icons/gender.svg";

const PLACEHOLDER = "INSERISCI NOME";

const initialPlayers = [
    { id: 1, label: "Giocatore 1", name: "", gender: "female" },
    { id: 2, label: "Giocatore 2", name: "", gender: "male" },
    { id: 3, label: "Giocatore 3", name: "", gender: "female" },
    { id: 4, label: "Giocatore 4", name: "", gender: "male" },
    { id: 5, label: "Giocatore 5", name: "", gender: "female" },
    { id: 6, label: "Giocatore 6", name: "", gender: "male" },
];

export default function TavoloAttesa() {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode;

    // Se arriva da "Ricomincia", ripristina i nomi salvati
    const savedGiocatori = location.state?.giocatori;
    const restoredPlayers = savedGiocatori
        ? initialPlayers.map((p, i) => ({
            ...p,
            name: savedGiocatori[i] !== PLACEHOLDER ? (savedGiocatori[i] ?? "") : "",
        }))
        : initialPlayers;

    const [players, setPlayers] = useState(restoredPlayers);
    const [editingId, setEditingId] = useState(null);
    const [editingVal, setEditingVal] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (editingId !== null && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const toggleAvatar = (id) => {
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, gender: p.gender === "female" ? "male" : "female" }
                    : p
            )
        );
    };

    const startEdit = (player) => {
        setEditingId(player.id);
        setEditingVal(player.name);
    };

    const commitEdit = () => {
        const trimmed = editingVal.trim().toUpperCase();
        setPlayers((prev) =>
            prev.map((p) => (p.id === editingId ? { ...p, name: trimmed } : p))
        );
        setEditingId(null);
        setEditingVal("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") commitEdit();
        if (e.key === "Escape") { setEditingId(null); setEditingVal(""); }
    };

    const handleAnnulla = () => {
        navigate(mode === "join" ? "/unisciti" : "/crea-partita");
    };

    const handleIniziaGioco = () => {
        navigate("/gioco", {
            state: {
                playerName: players[0].name || PLACEHOLDER,
                giocatori: players.map((p) => p.name || PLACEHOLDER),
                mode,
            },
        });
    };

    return (
        <main className="attesa-page" aria-label="Tavolo di attesa">
            <section className="attesa-screen">

                <div className="attesa-panel">
                    <div className="attesa-panel-inner">

                        <div className="attesa-code">
                            <span>Code: 79531</span>
                        </div>

                        <div className="attesa-icons-card">
                            <img src={frecceSvg} alt="frecce" className="attesa-icon" />
                            <img src={genderSvg} alt="gender" className="attesa-icon" />
                        </div>

                        <ol className="attesa-list" aria-label="Giocatori in attesa">
                            {players.map((player) => (
                                <li key={player.id} className="attesa-player">
                                    <button
                                        className="attesa-avatar-btn"
                                        onClick={() => toggleAvatar(player.id)}
                                        aria-label={`Cambia avatar ${player.label}`}
                                    >
                                        <img
                                            src={player.gender === "female" ? avatarFemale : avatarMale}
                                            alt={player.gender}
                                            className="attesa-avatar"
                                        />
                                    </button>

                                    <div className="attesa-player-info">
                                        <span className="attesa-player-label">{player.label}</span>

                                        {editingId === player.id ? (
                                            <input
                                                ref={inputRef}
                                                className="attesa-player-name-input"
                                                value={editingVal}
                                                onChange={(e) => setEditingVal(e.target.value)}
                                                onBlur={commitEdit}
                                                onKeyDown={handleKeyDown}
                                                maxLength={16}
                                                aria-label={`Modifica nome ${player.label}`}
                                            />
                                        ) : (
                                            <span
                                                className={`attesa-player-name attesa-player-name--editable ${!player.name ? "attesa-player-name--placeholder" : ""}`}
                                                onClick={() => startEdit(player)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => e.key === "Enter" && startEdit(player)}
                                                aria-label={`Modifica nome: ${player.name || PLACEHOLDER}`}
                                            >
                                                {player.name || PLACEHOLDER}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ol>

                    </div>
                </div>

                <div className="attesa-actions">
                    <button
                        className="attesa-btn attesa-btn--gioca"
                        type="button"
                        onClick={handleIniziaGioco}
                    >
                        INIZIA
                    </button>
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