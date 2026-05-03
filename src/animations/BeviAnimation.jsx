import "./BeviAnimation.css";

export default function BeviAnimation({ giocatore, onClose }) {
    return (
        <div className="bevi-overlay" onClick={onClose}>

            <div className="bevi-circle">
                <img
                    src={new URL("../assets/images/bg-animazioneBevi.png", import.meta.url).href}
                    alt=""
                    className="bevi-bg"
                />
                <img
                    src={new URL("../assets/images/bevi.png", import.meta.url).href}
                    alt="bevi"
                    className="bevi-personaggio"
                />
            </div>

            <p className="bevi-titolo">{giocatore} DEVI BERE!</p>
            <p className="bevi-sottotitolo">{giocatore} deve bere!</p>
            <span className="bevi-hint">Tocca per continuare</span>

        </div>
    );
}