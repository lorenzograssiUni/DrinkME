import { useEffect } from "react";
import "./BeerLoader.css";

export default function BeerLoader({ onComplete }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 2300);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="beer-loader">
            <div className="beer-loader__pour" />

            <div className="beer-loader__liquid">
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="beer-loader__bubble" />
                ))}
            </div>

            <div className="beer-loader__foam-layer">
                <div className="beer-loader__foam-base" />
                {Array.from({ length: 22 }).map((_, i) => (
                    <div key={i} className="beer-loader__foam-circle" />
                ))}
            </div>
        </div>
    );
}