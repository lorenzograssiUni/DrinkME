import { useState, useEffect } from "react";
import { socket } from "../socket";
import "./BottoneAnimation.css";

export default function BottoneAnimation({ players, playerIndex, onClose }) {
    const [fase, setFase] = useState("attesa"); // "attesa" | "gioca" | "risultato"
    const [haPressed, setHaPressed] = useState(false);
    const [pressedCount, setPressedCount] = useState(0);
    const [total, setTotal] = useState(players?.filter(p => p.connected !== false).length ?? 1);
    const [loser, setLoser] = useState(null);
    const [pressing, setPressing] = useState(false);

    useEffect(() => {
        const onGameStart = ({ total: t }) => {
            setTotal(t);
            setFase("gioca");
        };
        const onButtonPressed = ({ pressedCount: pc, total: t }) => {
            setPressedCount(pc);
            setTotal(t);
        };
        const onButtonLoser = ({ loserIndex, loserName }) => {
            setLoser({ loserIndex, loserName });
            setFase("risultato");
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
        if (haPressed || fase !== "gioca") return;
        setPressing(true);
        setTimeout(() => setPressing(false), 150);
        setHaPressed(true);
        socket.emit("press-button");
    };

    const isLoser = loser?.loserIndex === playerIndex;

    return (
        <div className="bottone-overlay" onClick={fase === "risultato" ? onClose : undefined}>
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

                {fase === "attesa" && (
                    <div className="bottone-countdown">
                        <span className="bottone-countdown-emoji">⏳</span>
                    </div>
                )}

                {fase === "gioca" && (
                    <button
                        className={`bottone-btn${haPressed ? " pressed" : ""}${pressing ? " pressing" : ""}`}
                        onClick={handlePress}
                        disabled={haPressed}
                    >
                        {haPressed ? "✓" : "PRESS ME"}
                    </button>
                )}

                {fase === "risultato" && (
                    <div className={`bottone-result${isLoser ? " loser" : " winner"}`}>
                        <span className="bottone-result-emoji">{isLoser ? "🍺" : "🎉"}</span>
                    </div>
                )}
            </div>

            {fase === "attesa" && (
                <>
                    <p className="bottone-titolo">PREPARATEVI!</p>
                    <p className="bottone-sottotitolo">Il bottone apparirà a breve... ⏳</p>
                </>
            )}

            {fase === "gioca" && (
                <>
                    <p className="bottone-titolo">PREMI IL BOTTONE!</p>
                    <p className="bottone-sottotitolo">
                        {pressedCount}/{total} hanno premuto — l'ultimo beve! 🍺
                    </p>
                    <span className="bottone-hint">Premi prima degli altri!</span>
                </>
            )}

            {fase === "risultato" && (
                <>
                    <p className="bottone-titolo">{isLoser ? "HAI PERSO! 😭" : "SALVO! 🎉"}</p>
                    <p className="bottone-sottotitolo">
                        {loser.loserName} è stato l'ultimo — deve bere!
                    </p>
                    <span className="bottone-hint">Tocca per continuare</span>
                </>
            )}
        </div>
    );
}
