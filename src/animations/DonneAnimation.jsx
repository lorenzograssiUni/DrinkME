import "./DonneAnimation.css";

export default function DonneAnimation({ onClose }) {
    return (
        <div className="donne-overlay" onClick={onClose}>
            <div className="donne-circle">
                <div className="icon__glass-wine" />
            </div>

            <p className="donne-titolo">BEVONO LE DONNE!</p>
            <p className="donne-sottotitolo">Tutte le donne devono bere! 🍷</p>
            <span className="donne-hint">Tocca per continuare</span>
        </div>
    );
}
