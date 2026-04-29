import { useNavigate } from "react-router-dom"
import "./Accesso.css"

const actions = [
    {
        id: "create-game",
        label: "Crea partita",
        backgroundColor: "#e2b04e",
        className: "button-create",
        path: "/crea-partita",
    },
    {
        id: "join-game",
        label: "Unisciti",
        backgroundColor: "#d13d38",
        className: "button-join",
        path: "/unisciti",
    },
]

export default function Accesso() {
    const navigate = useNavigate()

    return (
        <main className="accesso-page" aria-label="Accesso">
            <section className="accesso-screen">
                <h1 className="sr-only">Drink Me</h1>

                <div className="accesso-buttons">
                    {actions.map((action) => (
                        <button
                            key={action.id}
                            type="button"
                            className={`accesso-button ${action.className}`}
                            style={{ backgroundColor: action.backgroundColor }}
                            aria-label={action.label}
                            onClick={() => navigate(action.path)}
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            </section>
        </main>
    )
}