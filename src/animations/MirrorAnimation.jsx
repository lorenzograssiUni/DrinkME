import specchioPng from "../assets/images/specchio.png";
import "./MirrorAnimation.css";

export default function MirrorAnimation({ giocatore, players = [], playerIndex, isChooser, onClose }) {
    const selectablePlayers = players.filter((p) => p.connected !== false && p.index !== playerIndex);

    // VISTA PER GLI ALTRI GIOCATORI: animazione full screen classica
    if (!isChooser) {
        return (
            <div className="mirror-overlay" onClick={onClose}>
                <div className="mirror-circle">
                    <img
                        src={specchioPng}
                        alt="Specchio"
                        className="mirror-reveal"
                        draggable="false"
                    />
                    <div className="mirror-glare mirror-glare--1" />
                    <div className="mirror-glare mirror-glare--2" />
                    <div className="mirror-glare mirror-glare--3" />
                </div>

                <p className="mirror-titolo">{giocatore} ha lo Specchio!</p>
                <span className="mirror-sottotitolo">Scegli chi beve con te</span>
                <span className="mirror-emoji">🍺🪞🍺</span>
                <span className="mirror-hint">Tocca per continuare</span>
            </div>
        );
    }

    // VISTA PER CHI HA PESCATO IL 5: cerchio piccolo in alto + titolo + tabella scelta
    return (
        <div className="mirror-overlay" onClick={onClose}>
            <div className="mirror-inner" onClick={(e) => e.stopPropagation()}>
                <div className="mirror-circle mirror-circle--small">
                    <img
                        src={specchioPng}
                        alt="Specchio"
                        className="mirror-reveal"
                        draggable="false"
                    />
                    <div className="mirror-glare mirror-glare--1" />
                    <div className="mirror-glare mirror-glare--2" />
                    <div className="mirror-glare mirror-glare--3" />
                </div>

                <p className="mirror-titolo mirror-titolo--chooser">
                    Scegli il giocatore che berrà con te
                </p>

                <ol className="aiuto-list mirror-list">
                    {selectablePlayers.map((p) => (
                        <li
                            key={p.index}
                            className="aiuto-item aiuto-item--forzabile mirror-list-item"
                            onClick={() => onClose()}
                        >
                            <span className="aiuto-carta">{p.index + 1}</span>
                            <span className="aiuto-testo">
                                {p.name || `Giocatore ${p.index + 1}`}
                                {p.isHost ? " 👑" : ""}
                                {p.index === playerIndex ? " (tu)" : ""}
                            </span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
