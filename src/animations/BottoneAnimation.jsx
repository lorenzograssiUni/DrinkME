import { useState, useEffect } from "react";
import { socket } from "../socket";
import "./BottoneAnimation.css";

export default function BottoneAnimation({ playerIndex, onClose }) {
    const [attivo, setAttivo] = useState(false);      // bottone grigio -> rosso
    const [haPressed, setHaPressed] = useState(false);
    const [pressedCount, setPressedCount] = useState(0);
    const [total, setTotal] = useState(null);          // arriva dal server
    const [loser, setLoser] = useState(null);
    const [pressing, setPressing] = useState(false);

    useEffect(() => {
        const onGameStart = ({ total: t }) => {
            setTotal(t);
            setAttivo(true);
        };
        const onButtonPressed = ({ pressedCount: pc, total: t }) => {
            setPressedCount(pc);
            setTotal(t);
        };
        const onButtonLoser = ({ loserIndex, loserName }) => {
            setLoser({ loserIndex, loserName });
        };

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

            {/* Titolo in alto */}
            <p className="bottone-titolo">
                {loser
                    ? (isLoser ? "HAI PERSO! 😭" : "SALVO! 🎉")
                    : "PREMI IL BOTTONE QUANDO È ATTIVO!"}
            </p>

            {/* Cerchio decorativo */}
            <div className="bottone-circle">
                <span className="bottone-bg b1">⚡</span>
                <span className="bottone-bg b2">💥</span>
                <span className="bottone-bg b3">⚡</span>
                <span className="bottone-bg b4">💥</span>
                <span className="bottone-bg b5">⚡</span>
                <span className="bottone-bg b6">💥</span>
                <span className="bottone-bg b7">⚡</span>
                <span className="bottone-bg b8">💥</span>
                <span className="bottone-bg b9">⚡</span>
                <span className="bottone-bg b10">💥</span>
                <span className="bottone-bg b11">⚡</span>
                <span className="bottone-bg b12">💥</span>

                {loser ? (
                    <div className={`bottone-result${isLoser ? " loser" : " winner"}`}>
                        <span className="bottone-result-emoji">{isLoser ? "🍺" : "🎉"}</span>
                    </div>
                ) : (
                    <span className="bottone-status-emoji">
                        {attivo ? (haPressed ? "✅" : "🔴") : "⏳"}
                    </span>
                )}
            </div>

            {/* Sottotitolo */}
            {loser ? (
                <p className="bottone-sottotitolo">
                    {loser.loserName} è stato l'ultimo — deve bere!
                </p>
            ) : (
                <p className="bottone-sottotitolo">
                    {total !== null
                        ? `${pressedCount}/${total} hanno premuto — l'ultimo beve! 🍺`
                        : "Aspetta il segnale..."
                    }
                </p>
            )}

            {/* Bottone in basso */}
            {!loser && (
                <button
                    className={[
                        "bottone-btn",
                        attivo && !haPressed ? "attivo" : "",
                        haPressed ? "premuto" : "",
                        pressing ? "pressing" : "",
                        !attivo ? "disabilitato" : "",
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
