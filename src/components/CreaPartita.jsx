import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./CreaPartita.css"
import NumeroGiocatori from "./NumeroGiocatori"

export default function CreaPartita() {
    const [selectedPlayers, setSelectedPlayers] = useState(3)
    const navigate = useNavigate()

    return (
        <main className="crea-partita-page" aria-label="Crea partita">
            <section className="crea-partita-screen">
                <h1 className="crea-partita-title">
                    IMPOSTA
                    <br />
                    PARTITA
                </h1>

                <div className="crea-partita-subtitle">
                    NUMERO DI GIOCATORI
                </div>

                <div className="crea-partita-selector">
                    <NumeroGiocatori
                        value={selectedPlayers}
                        onChange={setSelectedPlayers}
                    />
                </div>

                <button
                    type="button"
                    className="crea-partita-primary-button"
                    aria-label={`Avvia partita con ${selectedPlayers} giocatori`}
                    onClick={() => navigate("/attesa", { state: { mode: "create", players: selectedPlayers } })}
                >
                    AVVIA PARTITA
                </button>

                <button
                    type="button"
                    className="crea-partita-secondary-button"
                    aria-label="Annulla"
                    onClick={() => navigate("/accesso")}
                >
                    ANNULLA
                </button>
            </section>
        </main>
    )
}