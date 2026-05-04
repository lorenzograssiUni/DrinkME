import "./UominiAnimation.css";

export default function UominiAnimation({ onClose }) {
    return (
        <div className="uomini-overlay" onClick={onClose}>
            <div className="uomini-circle">
                {/* Emoji sfondo */}
                <span className="uomini-bg e1">💪</span>
                <span className="uomini-bg e2">⚡</span>
                <span className="uomini-bg e3">🔥</span>
                <span className="uomini-bg e4">💪</span>
                <span className="uomini-bg e5">⚡</span>
                <span className="uomini-bg e6">🔥</span>
                <span className="uomini-bg e7">💪</span>
                <span className="uomini-bg e8">⚡</span>
                <span className="uomini-bg e9">🔥</span>
                <span className="uomini-bg e10">💪</span>
                <span className="uomini-bg e11">⚡</span>
                <span className="uomini-bg e12">🔥</span>

                {/* Faccia con baffi */}
                <div className="uomini-face">
                    <div className="uomini-eyes">
                        <div className="uomini-eye left" />
                        <div className="uomini-eye right" />
                    </div>
                    <div className="uomini-nose" />
                    <div className="uomini-mustache">
                        <div className="uomini-must-left" />
                        <div className="uomini-must-right" />
                    </div>
                </div>
            </div>

            <p className="uomini-titolo">BEVONO I MASCHI!</p>
            <p className="uomini-sottotitolo">Tutti gli uomini devono bere! 🍺</p>
            <span className="uomini-hint">Tocca per continuare</span>
        </div>
    );
}
