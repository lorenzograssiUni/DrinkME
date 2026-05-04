import "./UominiAnimation.css";

export default function UominiAnimation({ onClose }) {
    return (
        <div className="uomini-overlay" onClick={onClose}>
            <div className="uomini-circle">
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

                {/* Baffi SVG classici con punte arriciolate */}
                <svg
                    className="uomini-mustache-svg"
                    viewBox="0 0 200 90"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Baffo sinistro */}
                    <path
                        d="
                            M 100 52
                            C 88 52, 72 48, 60 42
                            C 44 34, 28 28, 16 34
                            C  8 38,  4 46,  8 52
                            C 12 58, 20 58, 26 54
                            C 32 50, 34 44, 30 40
                            C 36 46, 36 56, 28 62
                            C 20 68, 10 64, 8 56
                            C  4 44, 14 34, 28 30
                            C 44 26, 62 34, 76 42
                            C 86 48, 94 52, 100 52
                            Z
                        "
                        fill="#ffffff"
                    />
                    {/* Baffo destro (speculare) */}
                    <path
                        d="
                            M 100 52
                            C 112 52, 128 48, 140 42
                            C 156 34, 172 28, 184 34
                            C 192 38, 196 46, 192 52
                            C 188 58, 180 58, 174 54
                            C 168 50, 166 44, 170 40
                            C 164 46, 164 56, 172 62
                            C 180 68, 190 64, 192 56
                            C 196 44, 186 34, 172 30
                            C 156 26, 138 34, 124 42
                            C 114 48, 106 52, 100 52
                            Z
                        "
                        fill="#ffffff"
                    />
                </svg>
            </div>

            <p className="uomini-titolo">BEVONO I MASCHI!</p>
            <p className="uomini-sottotitolo">Tutti gli uomini devono bere! 🍺</p>
            <span className="uomini-hint">Tocca per continuare</span>
        </div>
    );
}
