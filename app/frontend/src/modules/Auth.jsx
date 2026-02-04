import { useState, useEffect } from "react";
import logo from "../../../../assets/img/pesterchum-logo.png";
import style from "../../../../assets/styles/auth.module.css";

export default function Auth({ setStatus }) {
    const [runtimeReady, setRuntimeReady] = useState(false);
    const [authtype, setAuthtype] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.runtime) {
                setRuntimeReady(true);
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const AuthUser = async (e) => {
        e.preventDefault();
        setError(null);

        if (!runtimeReady) {
            setError("App is still loading...");
            return;
        }

        if (!username || !password) {
            setError("Username and password required");
            return;
        }

        setLoading(true);

        try {
            if (authtype === "login") {
                await window.runtime.invoke("AuthService.Login", username, password);
                setStatus("client");
            }

            if (authtype === "register") {
                await window.runtime.invoke("AuthService.Register", username, password);
                setAuthtype("login");
            }
        } catch (err) {
            setError(err.message || "Auth failed");
        } finally {
            setLoading(false);
        }
    };

    if (!runtimeReady) return <p>Loading...</p>;

    return (
        <div className={style.auth}>
            <div className={style.auth__container}>
                <img className={style.auth__container_image} src={logo} alt="logo" />
                <p className={style.auth__container_title}>
                    {authtype === "login" ? "Login to Pesterchum" : "Register to Pesterchum"}
                </p>

                <form className={style.auth__container_from} onSubmit={AuthUser}>
                    <input
                        className={style.auth__container_from_input}
                        placeholder="Your nickname"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        className={style.auth__container_from_input}
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    {error && <p className={style.auth__container_from_error}>{error}</p>}

                    <button
                        type="submit"
                        className={style.auth__container_from_btn}
                        disabled={loading}
                    >
                        {authtype === "login" ? "Login" : "Register"}
                    </button>
                </form>

                {authtype === "login" ? (
                    <p className={style.auth__container_text} onClick={() => setAuthtype("register")}>
                        Don't have an account? Register
                    </p>
                ) : (
                    <p className={style.auth__container_text} onClick={() => setAuthtype("login")}>
                        Already have an account? Login
                    </p>
                )}
            </div>
        </div>
    );
}
