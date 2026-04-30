import { createPortal } from "react-dom";
import "./VikingAnimation.css";

export default function VikingAnimation({ giocatore, onClose }) {
    return createPortal(
        <div className="viking-overlay" onClick={onClose}>
            <div className="viking-wave" />
            <div className="viking-ship">🚢</div>
            <p className="viking-titolo">⚔️ {giocatore} è un Vichingo! ⚔️</p>
            <span className="viking-hint">Tocca per continuare</span>
        </div>,
        document.body
    );
}