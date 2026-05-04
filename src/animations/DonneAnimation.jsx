import "./DonneAnimation.css";

export default function DonneAnimation({ onClose }) {
    return (
        <div className="donne-overlay" onClick={onClose}>
            <div className="donne-circle">
                <div className="icon__glass-wine" />
                <span className="donne-cuore donne-cuore-1">💖</span>
                <span className="donne-cuore donne-cuore-2">✨</span>
                <span className="donne-cuore donne-cuore-3">💕</span>
                <span className="donne-cuore donne-cuore-4">⭐</span>
                <span className="donne-cuore donne-cuore-5">💗</span>
                <span className="donne-cuore donne-cuore-6">✨</span>
            </div>

            <p className="donne-titolo">BEVONO LE DONNE!</p>
            <p className="donne-sottotitolo">Tutte le donne devono bere! 🍷</p>
            <span className="donne-hint">Tocca per continuare</span>
        </div>
    );
}
