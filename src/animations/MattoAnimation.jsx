import "./MattoAnimation.css";

export default function MattoAnimation({ giocatore, onClose }) {
    return (
        <div className="matto-overlay" onClick={onClose}>

            <div className="matto-circle">
                <div className="matto-scroll-track">
                    <span className="matto-sssh-scroll">SSSSSSSSSSSSH!</span>
                </div>
                <span className="matto-emoji">🤫</span>
            </div>

            <p className="matto-titolo">{giocatore} è il matto!</p>
            <span className="matto-sottotitolo">Chi risponde alle sue domande… beve!</span>
            <span className="matto-hint">Tocca per continuare</span>

        </div>
    );
}