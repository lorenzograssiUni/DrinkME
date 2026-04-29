import { Routes, Route, Navigate } from "react-router-dom";
import Accesso from "./components/Accesso";
import CreaPartita from "./components/CreaPartita";
import Unisciti from "./components/Unisciti";
import TavoloAttesa from "./components/TavoloAttesa";
import Gioco from "./components/Gioco";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/accesso" replace />} />
            <Route path="/accesso" element={<Accesso />} />
            <Route path="/crea-partita" element={<CreaPartita />} />
            <Route path="/unisciti" element={<Unisciti />} />
            <Route path="/attesa" element={<TavoloAttesa />} />
            <Route path="/gioco" element={<Gioco />} />
        </Routes>
    );
}

export default App;