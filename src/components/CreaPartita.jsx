import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreaPartita.css";
import NumeroGiocatori from "./NumeroGiocatori";
import { socket } from "../socket";

export default function CreaPartita() {
    const [selectedPlayers, setSelectedPlayers] = useState(3);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleAvvia = () => {
        setLoading(true);
        setError("");

        if (!socket.connected) socket.connect();

        socket.emit("create-room", { numPlayers: selectedPlayers }, (res) => {
            setLoading(false);
            if (!res.ok) { setError("Errore nella creazione della stanza."); return; }
            navigate("/attesa", {
                state: {
                    mode: "create",
                    roomCode: res.code,
                    playerIndex: res.playerIndex,
                    maxPlayers: res.maxPlayers,
                    isHost: true,
                },
            });
        });
    };

    return (
        <main className="crea-partita-page" aria-label="Crea partita">
            <section className="crea-partita-screen">
                <h1 className="crea-partita-title">
                    IMPOSTA
                    <br />
                    PARTITA
                </h1>

                <div className="crea-partita-subtitle">NUMERO DI GIOCATORI</div>

                <div className="crea-partita-selector">
                    <NumeroGiocatori value={selectedPlayers} onChange={setSelectedPlayers} />
                </div>

                {error && <p style={{ color: "#c93e37", fontWeight: 700, fontSize: 14 }}>{error}</p>}

                <button
                    type="button"
                    className="crea-partita-primary-button"
                    disabled={loading}
                    onClick={handleAvvia}
                >
                    {loading ? "..." : "AVVIA PARTITA"}
                </button>

                <button
                    type="button"
                    className="crea-partita-secondary-button"
                    onClick={() => navigate("/accesso")}
                >
                    ANNULLA
                </button>
            </section>
        </main>
    );
}