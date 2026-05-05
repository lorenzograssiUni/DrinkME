import { useState, useEffect } from "react";
import { socket } from "../socket";
import "./BottoneAnimation.css";

export default function BottoneAnimation({ players, playerIndex, onClose }) {
    const [bottoneVisibile, setBottoneVisibile] = useState(false);
    const [haPressed, setHaPressed] = useState(false);
    const [pressedCount, setPressedCount] = useState(0);
    const [total] = useState(players?.filter(p => p.connected !== false).length ?? 1);
    const [loser, setLoser] = useState(null);
    const [pressing, setPressing] = useState(false);

    // Delay randomico 1-10s lato client, uguale per tutti grazie al server
    useEffect(() => {
        const delay = Math.floor(Math.random() * 9000) + 1000;
        const t = setTimeout(() => setBottoneVisibile(true), delay);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const onButtonPressed = ({ pressedCount: pc }) => setPressedCount(pc);
        const onButtonLoser = ({ loserIndex, loserName }) => setLoser({ loserIndex, loserName });
        socket.on("button-pressed", onButtonPressed);
        socket.on("button-loser", onButtonLoser);
        return () => {
            socket.off("button-pressed", onButtonPressed);
            socket.off("button-loser", onButtonLoser);
        };
    }, []);

    const handlePress = () => {
        if (haPressed || !bottoneVisibile || loser) return;
        setPressing(true);
        setTimeout(() => setPressing(false), 150);
        setHaPressed(true);
        socket.emit("press-button");
    };

    const isLoser = loser?.loserIndex === playerIndex;

    return (
        <div className="bottone-overlay" onClick={loser ? onClose : undefined}>
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
                ) : !bottoneVisibile ? (
                    <span className="bottone-countdown-emoji">⏳</span>
                ) : (
                    <button
                        className={`bottone-btn${haPressed ? " pressed" : ""}${pressing ? " pressing" : ""}`}
                        onClick={handlePress}
                        disabled={haPressed}
                    >
                        {haPressed ? "✓" : "PRESS ME"}
                    </button>
                )}
            </div>

            {loser ? (
                <>
                    <p className="bottone-titolo">{isLoser ? "HAI PERSO! 😭" : "SALVO! 🎉"}</p>
                    <p className="bottone-sottotitolo">{loser.loserName} è stato l'ultimo — deve bere!</p>
                    <span className="bottone-hint">Tocca per continuare</span>
                </>
            ) : !bottoneVisibile ? (
                <>
                    <p className="bottone-titolo">PREPARATEVI!</p>
                    <p className="bottone-sottotitolo">Il bottone apparirà a breve... ⏳</p>
                </>
            ) : (
                <>
                    <p className="bottone-titolo">PREMI IL BOTTONE!</p>
                    <p className="bottone-sottotitolo">{pressedCount}/{total} hanno premuto — l'ultimo beve! 🍺</p>
                    <span className="bottone-hint">Premi prima degli altri!</span>
                </>
            )}
        </div>
    );
}
