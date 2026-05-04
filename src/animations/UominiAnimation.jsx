import "./UominiAnimation.css";

export default function UominiAnimation({ onClose }) {
    return (
        <div className="uomini-overlay" onClick={onClose}>
            <div className="uomini-circle">
                {/* Sfondo cielo parallax */}
                <div className="uomini-sky" />
                {/* Mare parallax */}
                <div className="uomini-sea" />

                {/* Personaggio + nuvoletta - sopra tutto */}
                <div className="uomini-char-wrap">
                    <div className="uomini-thought">
                        <span className="uomini-thought-emoji">🍺</span>
                        <div className="uomini-thought-dot d1" />
                        <div className="uomini-thought-dot d2" />
                        <div className="uomini-thought-dot d3" />
                    </div>
                    <div className="uomini-bern" />
                </div>
            </div>

            <p className="uomini-titolo">BEVONO I MASCHI!</p>
            <p className="uomini-sottotitolo">Tutti gli uomini devono bere! 🍺</p>
            <span className="uomini-hint">Tocca per continuare</span>
        </div>
    );
}
