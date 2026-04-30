import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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

const REGOLE = [
    { carta: "2", testo: "Si for you — scegli chi beve" },
    { carta: "3", testo: "Si for me — beve chi pesca la carta" },
    { carta: "4", testo: "Vichingo — fai le corna (mare e remi), l'ultimo che lo fa beve" },
    { carta: "5", testo: "Specchio — ogni volta che bevi tu, beve anche chi ha ricevuto questa carta" },
    { carta: "6", testo: "Si for dicks — bevono i maschi" },
    { carta: "7", testo: "L'ultimo che alza la mano beve" },
    { carta: "8", testo: "Regola — inventa una regola per tutta la partita" },
    { carta: "9", testo: "Rima — di' una parola, si fa il giro: chi non rima beve" },
    { carta: "10", testo: "Categoria — scegli una categoria, si fa il giro: chi non trova beve" },
    { carta: "J", testo: "Non ho mai — di' qualcosa che non hai mai fatto, chi l'ha fatto beve" },
    { carta: "Q", testo: "Bevono le donne" },
    { carta: "K", testo: "Question Master — chi risponde senza fare una domanda beve" },
];

export default function Gioco() {
    const navigate = useNavigate();
    const location = useLocation();

    const listaGiocatori = location.state?.giocatori ?? [location.state?.playerName ?? "Giocatore"];

    const [mazzo, setMazzo] = useState(creaMazzo());
    const [cartaVisibile, setCarta] = useState(null);
    const [scoperta, setScoperta] = useState(false);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [menuAperto, setMenuAperto] = useState(false);
    const [aiutoAperto, setAiuto] = useState(false);
    const [giocatoriAperti, setGiocatori] = useState(false);

    const menuRef = useRef(null);
    const carteRimaste = mazzo.length;
    const mazzoEsaurito = mazzo.length === 0 && !scoperta;

    const giocatoreCorrente = listaGiocatori[playerIndex] ?? "Giocatore";

    useEffect(() => {
        function handleOutside(e) {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuAperto(false);
            }
        }
        if (menuAperto) document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [menuAperto]);

    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") {
                setAiuto(false);
                setGiocatori(false);
            }
        }
        if (aiutoAperto || giocatoriAperti) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [aiutoAperto, giocatoriAperti]);

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
            setPlayerIndex((prev) => (prev + 1) % listaGiocatori.length);
        }
    }, [scoperta, mazzo, listaGiocatori.length]);

    const handleRimescola = () => {
        setMazzo(creaMazzo());
        setCarta(null);
        setScoperta(false);
    };

    // Passa giocatori e mode allo state così TavoloAttesa non si resetta
    const handleRicomincia = () => {
        setMenuAperto(false);
        navigate("/attesa", {
            state: {
                giocatori: listaGiocatori,
                mode: location.state?.mode,
            },
        });
    };

    const handleEsci = () => { setMenuAperto(false); navigate("/accesso"); };
    const handleClassifica = () => { setMenuAperto(false); navigate("/classifica"); };

    return (
        <main className="gioco-page" aria-label="Schermata di gioco">
            <section className="gioco-screen">

                {/* ── TOP NAV ── */}
                <nav className="gioco-nav">
                    <button
                        className="gioco-nav-btn gioco-nav-giocatori"
                        aria-label="Giocatori"
                        onClick={() => setGiocatori(true)}
                    >
                        <img src={giocatoriSvg} alt="" className="gioco-nav-icon" />
                        <span>Giocatori</span>
                    </button>

                    <div className="gioco-nav-right" ref={menuRef}>
                        <button
                            className="gioco-nav-icon-btn"
                            aria-label="Aiuto — regole di gioco"
                            onClick={() => setAiuto(true)}
                        >
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

                        {menuAperto && (
                            <div className="gioco-dropdown" role="menu">
                                <button className="gioco-dropdown-item" role="menuitem" onClick={handleRicomincia}>
                                    🔄 Ricomincia partita
                                </button>
                                <button className="gioco-dropdown-item" role="menuitem" onClick={handleClassifica}>
                                    🏆 Classifica
                                </button>
                                <div className="gioco-dropdown-divider" />
                                <button className="gioco-dropdown-item gioco-dropdown-item--danger" role="menuitem" onClick={handleEsci}>
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

                    <div className="gioco-card-wrapper">
                        <button
                            className={`gioco-carta-btn ${scoperta ? "scoperta" : ""}`}
                            onClick={handleClick}
                            aria-label={scoperta ? "Ricopri la carta" : "Scopri una carta"}
                            disabled={mazzoEsaurito}
                        >
                            <img
                                src={scoperta && cartaVisibile ? cartaPath(cartaVisibile) : backPng}
                                alt={scoperta && cartaVisibile ? `Carta ${cartaVisibile}` : "Carta coperta"}
                                className="gioco-carta-img"
                            />
                        </button>

                        {mazzoEsaurito && (
                            <div className="gioco-mazzo-esaurito">
                                <button
                                    className="gioco-rimescola-btn"
                                    onClick={handleRimescola}
                                    aria-label="Rimescola il mazzo"
                                >
                                    🔀 Rimescola il mazzo
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── PLAYER CARD (beer) ── */}
                <div className="gioco-player-card">
                    <img src={beerPng} alt="Card giocatore" className="gioco-beer-img" draggable="false" />
                    <span className="gioco-player-name">{giocatoreCorrente.toUpperCase()}</span>
                </div>

            </section>

            {/* ── POPUP AIUTO ── */}
            {aiutoAperto && createPortal(
                <div className="aiuto-overlay" role="dialog" aria-modal="true" aria-label="Regole di gioco" onClick={() => setAiuto(false)}>
                    <div className="aiuto-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="aiuto-header">
                            <span className="aiuto-title">📖 REGOLE</span>
                            <button className="aiuto-close" aria-label="Chiudi" onClick={() => setAiuto(false)}>✕</button>
                        </div>
                        <ol className="aiuto-list">
                            {REGOLE.map(({ carta, testo }) => (
                                <li key={carta} className="aiuto-item">
                                    <span className="aiuto-carta">{carta}</span>
                                    <span className="aiuto-testo">{testo}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>,
                document.body
            )}

            {/* ── POPUP GIOCATORI ── */}
            {giocatoriAperti && createPortal(
                <div className="aiuto-overlay" role="dialog" aria-modal="true" aria-label="Lista giocatori" onClick={() => setGiocatori(false)}>
                    <div className="aiuto-popup" onClick={(e) => e.stopPropagation()}>
                        <div className="aiuto-header">
                            <span className="aiuto-title">👥 GIOCATORI</span>
                            <button className="aiuto-close" aria-label="Chiudi" onClick={() => setGiocatori(false)}>✕</button>
                        </div>
                        <ol className="aiuto-list">
                            {listaGiocatori.map((nome, i) => (
                                <li key={i} className={`aiuto-item ${i === playerIndex ? "aiuto-item--attivo" : ""}`}>
                                    <span className="aiuto-carta">{i + 1}</span>
                                    <span className="aiuto-testo">{nome}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>,
                document.body
            )}

        </main>
    );
}