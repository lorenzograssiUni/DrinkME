import { useState, useEffect } from "react";
import { socket } from "../socket";
import "./BottoneAnimation.css";

export default function BottoneAnimation({ playerIndex, onClose }) {
    const [attivo, setAttivo] = useState(false);
    const [haPressed, setHaPressed] = useState(false);
    const [pressedCount, setPressedCount] = useState(0);
    const [total, setTotal] = useState(null);
    const [loser, setLoser] = useState(null);
    const [pressing, setPressing] = useState(false);

    useEffect(() => {
        const onGameStart = ({ total: t }) => { setTotal(t); setAttivo(true); };
        const onButtonPressed = ({ pressedCount: pc, total: t }) => { setPressedCount(pc); setTotal(t); };
        const onButtonLoser = ({ loserIndex, loserName }) => setLoser({ loserIndex, loserName });

        socket.on("button-game-start", onGameStart);
        socket.on("button-pressed", onButtonPressed);
        socket.on("button-loser", onButtonLoser);
        return () => {
            socket.off("button-game-start", onGameStart);
            socket.off("button-pressed", onButtonPressed);
            socket.off("button-loser", onButtonLoser);
        };
    }, []);

    const handlePress = () => {
        if (!attivo || haPressed || loser) return;
        setPressing(true);
        setTimeout(() => setPressing(false), 150);
        setHaPressed(true);
        socket.emit("press-button");
    };

    const isLoser = loser?.loserIndex === playerIndex;

    return (
        <div className="bottone-overlay" onClick={loser ? onClose : undefined}>

            <div className="bottone-emoji-top">
                {loser ? (isLoser ? "😭" : "🎉") : (attivo ? "🔴" : "⏳")}
            </div>

            <p className="bottone-titolo">
                {loser
                    ? (isLoser ? "HAI PERSO!" : "SALVO!")
                    : (attivo ? "PREMI IL BOTTONE!" : "PREMI IL BOTTONE QUANDO È ATTIVO!")}
            </p>

            <p className="bottone-sottotitolo">
                {loser
                    ? `${loser.loserName} è stato l'ultimo — deve bere!`
                    : total !== null
                        ? `${pressedCount}/${total} hanno premuto — l'ultimo beve! 🍺`
                        : "Aspetta il segnale..."
                }
            </p>

            {!loser && (
                <button
                    className={[
                        "bottone-btn",
                        !attivo ? "disabilitato" : "",
                        attivo && !haPressed ? "attivo" : "",
                        haPressed ? "premuto" : "",
                        pressing ? "pressing" : "",
                    ].filter(Boolean).join(" ")}
                    onClick={handlePress}
                    disabled={!attivo || haPressed}
                >
                    {haPressed ? "✓ PREMUTO" : "PRESS ME"}
                </button>
            )}

            {loser && <span className="bottone-hint">Tocca per continuare</span>}
        </div>
    );
}
