import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import "./BottoneAnimation.css";

export default function BottoneAnimation({ playerIndex, players = [], delay, onClose }) {
    const [fase, setFase] = useState("attesa"); // attesa | attivo | premuto | fine
    const [pressedCount, setPressedCount] = useState(0);
    const [total, setTotal] = useState("?");
    const [pressedIndices, setPressedIndices] = useState([]);
    const [pressedTimes, setPressedTimes] = useState([]);
    const [loser, setLoser] = useState(null); // { loserIndex, loserName }
    const timerRef = useRef(null);

    // Avvia il timer locale al mount — nessuna dipendenza da socket per l'attivazione
    useEffect(() => {
        const ms = delay ?? 5000;
        timerRef.current = setTimeout(() => setFase("attivo"), ms);
        return () => clearTimeout(timerRef.current);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Ascolta gli eventi socket
    useEffect(() => {
        const onPressed = ({ pressedCount: pc, total: t, pressedIndices: pi = [], pressedTimes: pt = [] }) => {
            setPressedCount(pc);
            setTotal(t);
            setPressedIndices(pi);
            setPressedTimes(pt);
        };
        const onLoser = ({ loserIndex, loserName }) => {
            setLoser({ loserIndex, loserName });
            setFase("fine");
        };
        socket.on("button-pressed", onPressed);
        socket.on("button-loser", onLoser);
        return () => {
            socket.off("button-pressed", onPressed);
            socket.off("button-loser", onLoser);
        };
    }, []);

    const handlePress = () => {
        if (fase !== "attivo") return;
        setFase("premuto");
        socket.emit("press-button", (res) => {
            if (!res?.ok) setFase("attivo"); // rollback se errore server
        });
    };

    const pressedEntries = pressedIndices
        .map((idx, i) => {
            const player = players.find((p) => p.index === idx);
            if (!player) return null;
            return { player, timeMs: pressedTimes[i] ?? null };
        })
        .filter(Boolean);

    // ---- RENDER ----
    if (fase === "fine" && loser) {
        const isMe = loser.loserIndex === playerIndex;
        return (
            <div className="bottone-overlay" onClick={onClose}>
                <div className="bottone-emoji-top">{isMe ? "😭" : "🎉"}</div>
                <p className="bottone-titolo">{isMe ? "HAI PERSO!" : "SALVO!"}</p>
                <p className="bottone-sottotitolo">
                    <strong>{loser.loserName}</strong> è stato l'ultimo — deve bere! 🍺
                </p>
                <span className="bottone-hint">Tocca per continuare</span>
            </div>
        );
    }

    const isPremuto = fase === "premuto";

    return (
        <div className="bottone-overlay">
            <div className="bottone-emoji-top">{fase === "attivo" || fase === "premuto" ? "🔴" : "⏳"}</div>

            <p className="bottone-titolo">
                {fase === "attesa"
                    ? "PREMI IL BOTTONE QUANDO È ATTIVO!"
                    : isPremuto
                        ? "HAI PREMUTO"
                        : "PREMI IL BOTTONE!"}
            </p>

            {isPremuto ? (
                <>
                    <p className="bottone-sottotitolo">
                        {pressedCount}/{total} hanno già premuto:
                    </p>
                    <ol className="aiuto-list">
                        {pressedEntries.map(({ player: p, timeMs }, i) => {
                            const seconds = timeMs != null ? (timeMs / 1000).toFixed(2) : null;
                            return (
                                <li
                                    key={p.index}
                                    className={[
                                        "aiuto-item",
                                        p.index === playerIndex ? "aiuto-item--attivo" : "",
                                    ]
                                        .join(" ")
                                        .trim()}
                                >
                                    <span className="aiuto-carta">{i + 1}</span>
                                    <span className="aiuto-testo">
                                        {p.name || `Giocatore ${p.index + 1}`}
                                        {p.index === playerIndex ? " (tu)" : ""}
                                        {seconds ? ` — ${seconds}s` : ""}
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </>
            ) : (
                <>
                    <p className="bottone-sottotitolo">
                        {fase === "attesa"
                            ? "Aspetta il segnale..."
                            : `${pressedCount}/${total} hanno premuto — l'ultimo beve! 🍺`}
                    </p>

                    <button
                        className={[
                            "bottone-btn",
                            fase === "attesa" ? "disabilitato" : "",
                            fase === "attivo" ? "attivo" : "",
                            fase === "premuto" ? "premuto" : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onClick={handlePress}
                        disabled={fase !== "attivo"}
                    >
                        {fase === "premuto" ? "✓ PREMUTO" : "PRESS ME"}
                    </button>
                </>
            )}
        </div>
    );
}
