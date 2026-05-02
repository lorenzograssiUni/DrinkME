import "./SceltaAnimation.css";

export default function SceltaAnimation({ giocatore, onClose }) {
    return (
        <div className="scelta-overlay" onClick={onClose}>

            <div className="scelta-circle">
                <img
                    src={new URL("../assets/images/scelta.png", import.meta.url).href}
                    alt="scelta"
                    className="scelta-reveal"
                />
                <span className="scelta-sparkle">✦</span>
            </div>

            <p className="scelta-titolo">I WANT YOU!</p>
            <p className="scelta-sottotitolo">{giocatore} sta scegliendo chi deve bere</p>
            <span className="scelta-hint">Tocca per continuare</span>

        </div>
    );
}