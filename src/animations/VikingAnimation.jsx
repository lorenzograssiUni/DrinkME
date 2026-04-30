import vikingoPng from "../assets/images/vichingo.png";
import "./VikingAnimation.css";

export default function VikingAnimation({ giocatore, onClose }) {
    return (
        <div className="viking-overlay" onClick={onClose}>

            <div className="viking-circle">
                <div className="viking-wave" />
                <img
                    src={vikingoPng}
                    alt="Vichingo"
                    className="viking-ship"
                    draggable="false"
                />
            </div>

            <p className="viking-titolo">{giocatore} è un Vichingo!</p>
            <span className="viking-emoji">⚔️</span>

            <span className="viking-hint">Tocca per continuare</span>

        </div>
    );
}