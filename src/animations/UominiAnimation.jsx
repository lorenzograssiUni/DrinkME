import "./UominiAnimation.css";

export default function UominiAnimation({ onClose }) {
    return (
        <div className="uomini-overlay" onClick={onClose}>
            <div className="uomini-circle">
                {/* Emoji di sfondo */}
                <span className="uomini-bg e1">💪</span>
                <span className="uomini-bg e2">⚡</span>
                <span className="uomini-bg e3">👏</span>
                <span className="uomini-bg e4">🔥</span>
                <span className="uomini-bg e5">💪</span>
                <span className="uomini-bg e6">⚡</span>
                <span className="uomini-bg e7">🌟</span>
                <span className="uomini-bg e8">🔥</span>
                <span className="uomini-bg e9">🌟</span>
                <span className="uomini-bg e10">👏</span>
                <span className="uomini-bg e11">⚡</span>
                <span className="uomini-bg e12">💪</span>

                {/* Boccale birra */}
                <div className="uomini-beer">
                    <div className="uomini-beer-body">
                        <div className="uomini-beer-foam" />
                        <div className="uomini-beer-liquid" />
                        <div className="uomini-beer-bubble b1" />
                        <div className="uomini-beer-bubble b2" />
                        <div className="uomini-beer-bubble b3" />
                    </div>
                    <div className="uomini-beer-handle" />
                </div>
            </div>

            <p className="uomini-titolo">BEVONO I MASCHI!</p>
            <p className="uomini-sottotitolo">Tutti gli uomini devono bere! 🍺</p>
            <span className="uomini-hint">Tocca per continuare</span>
        </div>
    );
}
