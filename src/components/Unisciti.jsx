import { useId, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Unisciti.css"

export default function Unisciti() {
    const inputId = useId()
    const navigate = useNavigate()
    const [code, setCode] = useState("")

    const handleCodeChange = (event) => {
        const sanitizedValue = event.target.value.replace(/\D/g, "").slice(0, 5)
        setCode(sanitizedValue)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        if (code.length !== 5) return
        navigate("/attesa", { state: { mode: "join", code } })
    }

    const handleCancel = () => {
        setCode("")
        navigate("/accesso")
    }

    return (
        <main className="unisciti-page" aria-label="Unisciti alla stanza">
            <section className="unisciti-screen">
                <h1 className="unisciti-title">
                    UNISCITI
                    <br />
                    ALLA STANZA
                </h1>

                <form className="unisciti-form" onSubmit={handleSubmit}>
                    <label htmlFor={inputId} className="unisciti-subtitle">
                        INSERISCI IL CODICE
                    </label>

                    <div className="unisciti-code-card">
                        <div className="unisciti-code-card-inner">
                            <span className="unisciti-code-symbol" aria-hidden="true">
                                #
                            </span>

                            <input
                                id={inputId}
                                name="roomCode"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                aria-label="Inserisci il codice della stanza"
                                placeholder="00000"
                                value={code}
                                onChange={handleCodeChange}
                                maxLength={5}
                                className="unisciti-code-input"
                            />
                        </div>
                    </div>

                    <div className="unisciti-actions">
                        <button
                            type="submit"
                            className="unisciti-primary-button"
                            disabled={code.length !== 5}
                        >
                            UNISCITI
                        </button>

                        <button
                            type="button"
                            className="unisciti-secondary-button"
                            onClick={handleCancel}
                        >
                            ANNULLA
                        </button>
                    </div>
                </form>
            </section>
        </main>
    )
}