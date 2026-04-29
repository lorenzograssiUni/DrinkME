import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./TavoloAttesa.css";
import avatarFemale from "../assets/avatars/avatar-female.png";
import avatarMale from "../assets/avatars/avatar-male.png";
import frecceSvg from "../assets/icons/frecce.svg";
import genderSvg from "../assets/icons/gender.svg";

const initialPlayers = [
    { id: 1, label: "Giocatore 1", name: "TIZIO", gender: "female" },
    { id: 2, label: "Giocatore 2", name: "CAIO", gender: "male" },
    { id: 3, label: "Giocatore 3", name: "TIZIO", gender: "female" },
    { id: 4, label: "Giocatore 4", name: "SEMPRONIO", gender: "male" },
    { id: 5, label: "Giocatore 5", name: "LIVIA", gender: "female" },
    { id: 6, label: "Giocatore 6", name: "MARCO", gender: "male" },
];

export default function TavoloAttesa() {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode;

    const [players, setPlayers] = useState(initialPlayers);

    const toggleAvatar = (id) => {
        setPlayers((prev) =>
            prev.map((p) =>
                p.id === id
                    ? { ...p, gender: p.gender === "female" ? "male" : "female" }
                    : p
            )
        );
    };

    const handleAnnulla = () => {
        navigate(mode === "join" ? "/unisciti" : "/crea-partita");
    };

    return (
        <main className="attesa-page" aria-label="Tavolo di attesa">
            <section className="attesa-screen">

                {/* Code badge */}
                <div className="attesa-code">
                    <span>Code: 79531</span>
                </div>

                {/* Icons row */}
                <div className="attesa-icons">
                    <img src={frecceSvg} alt="frecce" className="attesa-icon" />
                    <img src={genderSvg} alt="gender" className="attesa-icon" />
                </div>

                {/* Scrollable player list */}
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
                                <span className="attesa-player-name">{player.name}</span>
                            </div>
                        </li>
                    ))}
                </ol>

                {/* Action buttons */}
                <div className="attesa-actions">
                    <button
                        className="attesa-btn attesa-btn--gioca"
                        type="button"
                        onClick={() => navigate("/gioco")}
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