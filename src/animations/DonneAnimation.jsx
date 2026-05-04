import "./DonneAnimation.css";

export default function DonneAnimation({ onClose }) {
    return (
        <div className="donne-overlay" onClick={onClose}>
            <div className="donne-circle">
                {/* Emoji di sfondo - dietro al bicchiere */}
                <span className="donne-cuore c1">💖</span>
                <span className="donne-cuore c2">✨</span>
                <span className="donne-cuore c3">💕</span>
                <span className="donne-cuore c4">⭐</span>
                <span className="donne-cuore c5">💗</span>
                <span className="donne-cuore c6">✨</span>
                <span className="donne-cuore c7">💞</span>
                <span className="donne-cuore c8">🌸</span>
                <span className="donne-cuore c9">💫</span>
                <span className="donne-cuore c10">💝</span>
                <span className="donne-cuore c11">❤️</span>
                <span className="donne-cuore c12">🌟</span>

                {/* Bicchiere sopra le emoji */}
                <div className="icon__glass-wine" />
            </div>

            <p className="donne-titolo">BEVONO LE DONNE!</p>
            <p className="donne-sottotitolo">Tutte le donne devono bere! 🍷</p>
            <span className="donne-hint">Tocca per continuare</span>
        </div>
    );
}
