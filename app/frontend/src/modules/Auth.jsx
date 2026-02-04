import { useState } from "react";
import logo from "../../../../assets/img/pesterchum-logo.png";
import style from "../../../../assets/styles/auth.module.css";
import { Login, Register } from "../../wailsjs/go/auth/AuthService.js";

export default function Auth({ setStatus }) {
    const [authtype, setAuthtype] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const AuthUser = async (e) => {
        e.preventDefault();
        setError(null);
        if (!username || !password) {
            setError("Username and password required");
            return;
        }
        setLoading(true);
        try {
            if (authtype === "login") {
                await Login(username, password);
                setStatus("client");
            } else if (authtype === "register") {
                await Register(username, password);
                setAuthtype("login");
            }
        } catch (err) {
            setError(err.message || "Auth failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={style.auth}>
            <div className={style.auth__container}>
                <img className={style.auth__container_image} src={logo} alt="logo" />
                <p className={style.auth__container_title}>{authtype === "login" ? "Login to Pesterchum" : "Register to Pesterchum"}</p>
                <form className={style.auth__container_from} onSubmit={AuthUser}>
                    <input className={style.auth__container_from_input} placeholder="Your nickname" value={username} onChange={e => setUsername(e.target.value)}/>
                    <input className={style.auth__container_from_input} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                    {error && <p className={style.auth__container_from_error}>{error}</p>}
                    <button type="submit" className={style.auth__container_from_btn} disabled={loading}>{authtype === "login" ? "Login" : "Register"}</button>
                </form>
                {authtype === "login" ? (
                    <p className={style.auth__container_text} onClick={() => setAuthtype("register")}>Don't have an account? Register</p>
                ) : (
                    <p className={style.auth__container_text} onClick={() => setAuthtype("login")}>Already have an account? Login</p>
                )}
            </div>
        </div>
    );
}