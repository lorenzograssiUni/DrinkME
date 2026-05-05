import { useState, useEffect } from "react";
import { socket } from "../socket";
import "./BottoneAnimation.css";

export default function BottoneAnimation({ players, playerIndex, onClose }) {
    const [haPressed, setHaPressed] = useState(false);
    const [pressedCount, setPressedCount] = useState(0);
    const [total, setTotal] = useState(players?.filter(p => p.connected !== false).length ?? 1);
    const [loser, setLoser] = useState(null);  // { loserIndex, loserName }
    const [pressing, setPressing] = useState(false);

    useEffect(() => {
        const onButtonPressed = ({ pressedCount: pc, total: t }) => {
            setPressedCount(pc);
            setTotal(t);
        };
        const onButtonLoser = ({ loserIndex, loserName }) => {
            setLoser({ loserIndex, loserName });
        };

        socket.on("button-pressed", onButtonPressed);
        socket.on("button-loser", onButtonLoser);
        return () => {
            socket.off("button-pressed", onButtonPressed);
            socket.off("button-loser", onButtonLoser);
        };
    }, []);

    const handlePress = () => {
        if (haPressed || loser) return;
        setPressing(true);
        setTimeout(() => setPressing(false), 150);
        setHaPressed(true);
        socket.emit("press-button");
    };

    const isLoser = loser?.loserIndex === playerIndex;

    return (
        <div className="bottone-overlay" onClick={loser ? onClose : undefined}>
            <div className="bottone-circle">
                {/* Emoji sfondo */}
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

                {!loser ? (
                    <button
                        className={`bottone-btn${haPressed ? " pressed" : ""}${pressing ? " pressing" : ""}`}
                        onClick={handlePress}
                        disabled={haPressed}
                    >
                        {haPressed ? "✓" : "PRESS ME"}
                    </button>
                ) : (
                    <div className={`bottone-result${isLoser ? " loser" : " winner"}`}>
                        <span className="bottone-result-emoji">{isLoser ? "🍺" : "🎉"}</span>
                    </div>
                )}
            </div>

            {!loser ? (
                <>
                    <p className="bottone-titolo">PREMI IL BOTTONE!</p>
                    <p className="bottone-sottotitolo">
                        {pressedCount}/{total} hanno premuto — l'ultimo beve! 🍺
                    </p>
                </>
            ) : (
                <>
                    <p className="bottone-titolo">{isLoser ? "HAI PERSO! 😭" : "SALVO! 🎉"}</p>
                    <p className="bottone-sottotitolo">
                        {loser.loserName} è stato l'ultimo — deve bere!
                    </p>
                    <span className="bottone-hint">Tocca per continuare</span>
                </>
            )}

            {!loser && (
                <span className="bottone-hint">Premi prima degli altri!</span>
            )}
        </div>
    );
}
