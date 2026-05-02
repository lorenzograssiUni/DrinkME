import specchioPng from "../assets/images/specchio.png";
import "./MirrorAnimation.css";

export default function MirrorAnimation({ giocatore, onClose }) {
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