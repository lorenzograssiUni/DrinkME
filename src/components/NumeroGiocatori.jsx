import { useId } from "react"
import chipIcon from "../assets/icons/player-chip.svg"

const options = [3, 4, 5, 6, 7, 8, 9, 10]

export default function NumeroGiocatori({
    value,
    onChange,
}) {
    const radioName = useId()

    return (
        <fieldset className="numero-giocatori">
            <legend className="sr-only">Seleziona il numero di giocatori</legend>

            <div className="numero-giocatori-grid">
                {options.map((option) => {
                    const isSelected = value === option

                    return (
                        <label
                            key={option}
                            className={`numero-chip ${isSelected ? "is-selected" : ""}`}
                        >
                            <input
                                className="sr-only"
                                type="radio"
                                name={radioName}
                                value={option}
                                checked={isSelected}
                                onChange={() => onChange(option)}
                                aria-label={`${option} giocatori`}
                            />

                            <span className="numero-chip-inner">
                                <span className="numero-chip-icon-wrap" aria-hidden="true">
                                    <img
                                        src={chipIcon}
                                        alt=""
                                        className="numero-chip-icon"
                                    />
                                </span>

                                <span className={`numero-chip-label ${option === 10 ? "is-ten" : ""}`}>
                                    {option}
                                </span>
                            </span>
                        </label>
                    )
                })}
            </div>
        </fieldset>
    )
}