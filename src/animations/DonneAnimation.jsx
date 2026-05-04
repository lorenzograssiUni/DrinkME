import "./DonneAnimation.css";

export default function DonneAnimation({ onClose }) {
    return (
        <div className="donne-overlay" onClick={onClose}>

            <div className="donne-circle">
                <svg className="donne-svg" viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
                    {/* Calice */}
                    <path
                        d="M60 20 L140 20 L115 110 Q100 130 100 140 L100 180 L75 180 L75 195 L125 195 L125 180 L100 180"
                        fill="none"
                        stroke="#f9a8d4"
                        strokeWidth="5"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                    {/* Liquido vino */}
                    <clipPath id="glass-clip">
                        <path d="M62 22 L138 22 L114 108 Q100 128 100 138 L100 139 L100 138 Q100 128 86 108 Z" />
                    </clipPath>
                    <rect
                        x="55" y="60" width="90" height="80"
                        fill="#e879a0"
                        opacity="0.85"
                        clipPath="url(#glass-clip)"
                        className="donne-wine"
                    />
                    {/* Bollicine */}
                    <circle cx="85" cy="110" r="4" fill="#fda4c4" opacity="0.9" className="donne-bolla donne-bolla-1" />
                    <circle cx="100" cy="95" r="3" fill="#fda4c4" opacity="0.8" className="donne-bolla donne-bolla-2" />
                    <circle cx="115" cy="105" r="5" fill="#fda4c4" opacity="0.7" className="donne-bolla donne-bolla-3" />
                    <circle cx="92" cy="80" r="3" fill="#fda4c4" opacity="0.9" className="donne-bolla donne-bolla-4" />
                    <circle cx="108" cy="75" r="4" fill="#fda4c4" opacity="0.7" className="donne-bolla donne-bolla-5" />
                    {/* Cuoricini */}
                    <text x="38" y="55" fontSize="18" className="donne-cuore donne-cuore-1">💖</text>
                    <text x="148" y="70" fontSize="14" className="donne-cuore donne-cuore-2">💕</text>
                    <text x="30" y="100" fontSize="12" className="donne-cuore donne-cuore-3">✨</text>
                    <text x="155" y="110" fontSize="16" className="donne-cuore donne-cuore-4">💖</text>
                    <text x="85" y="215" fontSize="12" className="donne-cuore donne-cuore-5">✨</text>
                </svg>
            </div>

            <p className="donne-titolo">BEVONO LE DONNE!</p>
            <p className="donne-sottotitolo">Tutte le donne devono bere! 🍷</p>
            <span className="donne-hint">Tocca per continuare</span>

        </div>
    );
}
