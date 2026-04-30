import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Gioco.css";
import giocatoriSvg from "../assets/icons/giocatori.svg";
import aiutoSvg from "../assets/icons/aiuto.svg";
import menuSvg from "../assets/icons/menu.svg";
import backPng from "../assets/images/cards/back.png";
import beerPng from "../assets/images/beer.png";

const SEMI = ["F", "P", "C", "Q"];
const VALORI = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

function creaMazzo() {
    return SEMI.flatMap((seme) => VALORI.map((valore) => `${valore}-${seme}`));
}

function cartaPath(nome) {
    return new URL(`../assets/images/cards/${nome}.png`, import.meta.url).href;
}

export default function Gioco() {
    const navigate = useNavigate();
    const location = useLocation();
    const giocatore = location.state?.playerName ?? "Giocatore";

    const [mazzo, setMazzo] = useState(creaMazzo());
    const [cartaVisibile, setCarta] = useState(null);
    const [scoperta, setScoperta] = useState(false);
    const [menuAperto, setMenuAperto] = useState(false);

    const menuRef = useRef(null);
    const carteRimaste = mazzo.length;

    // Chiudi il menu cliccando fuori
    useEffect(() => {
        function handleOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAperto(false);
            }
        }
        if (menuAperto) document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [menuAperto]);

    const handleClick = useCallback(() => {
        if (!scoperta) {
            if (mazzo.length === 0) return;
            const idx = Math.floor(Math.random() * mazzo.length);
            const scelta = mazzo[idx];
            setMazzo((prev) => prev.filter((_, i) => i !== idx));
            setCarta(scelta);
            setScoperta(true);
        } else {
            setScoperta(false);
        }
    }, [scoperta, mazzo]);

    const handleRicomincia = () => {
        setMazzo(creaMazzo());
        setCarta(null);
        setScoperta(false);
        setMenuAperto(false);
    };

    const handleEsci = () => {
        setMenuAperto(false);
        navigate("/accesso");
    };

    const handleClassifica = () => {
        setMenuAperto(false);
        navigate("/classifica");
    };

    return (
        <main className="gioco-page" aria-label="Schermata di gioco">
            <section className="gioco-screen">

                {/* ── TOP NAV ── */}
                <nav className="gioco-nav">
                    <button className="gioco-nav-btn gioco-nav-giocatori" aria-label="Giocatori">
                        <img src={giocatoriSvg} alt="" className="gioco-nav-icon" />
                        <span>Giocatori</span>
                    </button>

                    <div className="gioco-nav-right" ref={menuRef}>
                        <button className="gioco-nav-icon-btn" aria-label="Aiuto">
                            <img src={aiutoSvg} alt="" />
                        </button>
                        <button
                            className="gioco-nav-icon-btn"
                            aria-label="Menu"
                            aria-expanded={menuAperto}
                            onClick={() => setMenuAperto((v) => !v)}
                        >
                            <img src={menuSvg} alt="" />
                        </button>

                        {/* ── DROPDOWN MENU ── */}
                        {menuAperto && (
                            <div className="gioco-dropdown" role="menu">
                                <button
                                    className="gioco-dropdown-item"
                                    role="menuitem"
                                    onClick={handleRicomincia}
                                >
                                    🔄 Ricomincia partita
                                </button>
                                <button
                                    className="gioco-dropdown-item"
                                    role="menuitem"
                                    onClick={handleClassifica}
                                >
                                    🏆 Classifica
                                </button>
                                <div className="gioco-dropdown-divider" />
                                <button
                                    className="gioco-dropdown-item gioco-dropdown-item--danger"
                                    role="menuitem"
                                    onClick={handleEsci}
                                >
                                    🚪 Esci dalla partita
                                </button>
                            </div>
                        )}
                    </div>
                </nav>

                {/* ── CARD SECTION ── */}
                <div className="gioco-card-section">
                    <div className="gioco-cards-badge" aria-live="polite">
                        Cards: {carteRimaste}
                    </div>

                    <button
                        className={`gioco-carta-btn ${scoperta ? "scoperta" : ""}`}
                        onClick={handleClick}
                        aria-label={scoperta ? "Ricopri la carta" : "Scopri una carta"}
                        disabled={mazzo.length === 0 && !scoperta}
                    >
                        <img
                            src={scoperta && cartaVisibile ? cartaPath(cartaVisibile) : backPng}
                            alt={scoperta && cartaVisibile ? `Carta ${cartaVisibile}` : "Carta coperta"}
                            className="gioco-carta-img"
                        />
                    </button>
                </div>

                {/* ── PLAYER CARD (beer) ── */}
                <div className="gioco-player-card">
                    <img
                        src={beerPng}
                        alt="Card giocatore"
                        className="gioco-beer-img"
                        draggable="false"
                    />
                    <span className="gioco-player-name">{giocatore.toUpperCase()}</span>
                </div>

            </section>
        </main>
    );
}