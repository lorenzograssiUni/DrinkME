import "./DonneAnimation.css";
import womenMp4 from "../assets/images/women.mp4";

export default function DonneAnimation({ onClose }) {
    return (
        <div className="donne-overlay" onClick={onClose}>

            <div className="donne-circle">
                <video
                    src={womenMp4}
                    className="donne-video"
                    autoPlay
                    loop
                    muted
                    playsInline
                />
            </div>

            <p className="donne-titolo">BEVONO LE DONNE!</p>
            <p className="donne-sottotitolo">Tutte le donne devono bere!</p>
            <span className="donne-hint">Tocca per continuare</span>

        </div>
    );
}
