import { useLocation, useNavigate } from "react-router-dom";
import "./TavoloAttesa.css";
import avatarMale from "../assets/avatars/avatar-male.png";
import avatarFemale from "../assets/avatars/avatar-female.png";

function TavoloAttesa() {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode;

    const players = [
        { id: 1, title: "Giocatore 1", name: "TIZIO", avatar: avatarFemale },
        { id: 2, title: "Giocatore 2", name: "CAIO", avatar: avatarMale },
        { id: 3, title: "Giocatore 3", name: "SEMPRONIA", avatar: avatarFemale },
        { id: 4, title: "Giocatore 4", name: "FILIPPO", avatar: avatarMale },
    ];

    return (
        <div className="attesa-page">
            <div className="attesa-panel">
                <h1 className="attesa-title">STANZA D'ATTESA</h1>

                <p className="attesa-mode">
                    {mode === "create" ? "Hai creato il tavolo" : "Sei entrato nel tavolo"}
                </p>

                <div className="attesa-list">
                    {players.map((player) => (
                        <div key={player.id} className="attesa-player">
                            <img
                                src={player.avatar}
                                alt={player.name}
                                className="attesa-player-avatar"
                            />

                            <div className="attesa-player-info">
                                <span className="attesa-player-title">{player.title}</span>
                                <span className="attesa-player-name">{player.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="attesa-actions">
                    <button
                        className="attesa-btn secondary"
                        onClick={() => navigate("/unisciti")}
                    >
                        INDIETRO
                    </button>

                    <button className="attesa-btn primary">
                        INIZIA
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TavoloAttesa;