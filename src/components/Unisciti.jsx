import { useId, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Unisciti.css";
import { socket } from "../socket";

export default function Unisciti() {
    const inputId = useId();
    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Rejoin: se il server risponde con game-state-sync,
    // significa che il giocatore stava già giocando → vai direttamente a /gioco
    useEffect(() => {
        const onGameStateSync = ({
            roomCode,
            playerIndex,
            maxPlayers,
            isHost,
            players,
            currentPlayerIndex,
            deckCount,
            currentCard,
            cardRevealed,
        }) => {
            navigate("/gioco", {
                replace: true,
                state: {
                    roomCode,
                    playerIndex,
                    maxPlayers,
                    isHost,
                    players,
                    currentPlayerIndex,
                    deckCount,
                    currentCard,
                    cardRevealed,
                },
            });
        };

        socket.on("game-state-sync", onGameStateSync);

        return () => {
            socket.off("game-state-sync", onGameStateSync);
        };
    }, [navigate]);

    const handleCodeChange = (e) => {
        const val = e.target.value.replace(/\D/g, "").slice(0, 5);
        setCode(val);
        setError("");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (code.length !== 5) return;
        setLoading(true);
        setError("");

        if (!socket.connected) socket.connect();

        socket.emit("join-room", { code }, (res) => {
            setLoading(false);
            if (!res.ok) { setError(res.error ?? "Errore"); return; }

            // Rejoin in partita già avviata: aspetta game-state-sync dal server
            if (res.rejoined && res.inGame) return;

            navigate("/attesa", {
                state: {
                    mode: "join",
                    roomCode: code,
                    playerIndex: res.playerIndex,
                    maxPlayers: res.maxPlayers,
                    isHost: false,
                },
            });
        });
    };

    return (
        <main className="unisciti-page" aria-label="Unisciti alla stanza">
            <section className="unisciti-screen">
                <h1 className="unisciti-title">
                    UNISCITI
                    <br />
                    ALLA STANZA
                </h1>

                <form className="unisciti-form" onSubmit={handleSubmit}>
                    <label htmlFor={inputId} className="unisciti-subtitle">
                        INSERISCI IL CODICE
                    </label>

                    <div className="unisciti-code-card">
                        <div className="unisciti-code-card-inner">
                            <span className="unisciti-code-symbol" aria-hidden="true">#</span>
                            <input
                                id={inputId}
                                name="roomCode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                placeholder="00000"
                                value={code}
                                onChange={handleCodeChange}
                                maxLength={5}
                                className="unisciti-code-input"
                            />
                        </div>
                    </div>

                    {error && <p style={{ color: "#c93e37", fontWeight: 700, fontSize: 14 }}>{error}</p>}

                    <div className="unisciti-actions">
                        <button
                            type="submit"
                            className="unisciti-primary-button"
                            disabled={code.length !== 5 || loading}
                        >
                            {loading ? "..." : "UNISCITI"}
                        </button>
                        <button
                            type="button"
                            className="unisciti-secondary-button"
                            onClick={() => { setCode(""); navigate("/accesso"); }}
                        >
                            ANNULLA
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}