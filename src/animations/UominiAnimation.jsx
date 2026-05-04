import "./UominiAnimation.css";

export default function UominiAnimation({ onClose }) {
    return (
        <div className="uomini-overlay" onClick={onClose}>
            <p className="uomini-titolo">BEVONO I MASCHI!</p>

            <div className="uomini-scene">
                {/* Cielo parallax */}
                <div className="uomini-sky" />

                {/* Personaggio + nuvoletta */}
                <div className="uomini-char-wrap">
                    <div className="uomini-thought">
                        <span className="uomini-thought-emoji">🍺</span>
                        <div className="uomini-thought-dot d1" />
                        <div className="uomini-thought-dot d2" />
                        <div className="uomini-thought-dot d3" />
                    </div>
                    <div id="uomini-bern" />
                </div>

                {/* Mare parallax */}
                <div className="uomini-sea" />
            </div>

            <p className="uomini-sottotitolo">Tutti gli uomini devono bere! 🍺</p>
            <span className="uomini-hint">Tocca per continuare</span>
        </div>
    );
}
