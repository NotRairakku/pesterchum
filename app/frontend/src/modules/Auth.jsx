import { useState } from "react";
import { Login, Register } from "../../wailsjs/go/auth/Service.js";

import styles from "../../../../assets/styles/app.module.css";
import logo from "../../../../assets/img/pesterchum-logo.png";
import random_name_ico from "../../../../assets/img/mood/mood_chipper.png";
import hide_password from "../../../../assets/img/mood/mood_chipper.png";

export default function Auth({ loadUser }) {
    const [authtype, setAuthtype] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [inpytType, setInpytType] = useState('password');
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
                console.log("[Auth] Login successful to loading user");
                await loadUser();
            } else {
                await Register(username, password);
                await Login(username, password);
                console.log("[Auth] Register + auto-login successful to loading user");
                await loadUser();
            }
        } catch (err) {
                console.error("[Auth] Error:", err);
            setError(err?.message || "Auth failed");
        } finally {
            setLoading(false);
        }
    };

    const GenRandomName = () => {
        console.log('ok')
    }

    return (
        <div className={styles.auth}>
            <div className={styles.auth__container}>
                <img className={styles.auth__container_image} src={logo} alt="logo" />
                <p className={styles.auth__container_title}>{authtype === "login" ? "LOGIN to PESTERCHUM" : "REGISTER to PESTERCHUM"}</p>
                <form className={styles.auth__container_from} onSubmit={AuthUser}>
                    <div className={styles.container_from}>
                        <input className={styles.container_from_input} placeholder="Your cool nickname"
                               value={username} onChange={(e) =>
                            setUsername(e.target.value)} disabled={loading}/>
                        <div className={styles.container_from_content}>
                            <img className={styles.content__img} src={random_name_ico} onClick={GenRandomName}/>
                        </div>
                    </div>
                    <div className={styles.container_from}>
                        <input className={styles.container_from_input} placeholder="Password"
                               type={inpytType} value={password} onChange={(e) =>
                            setPassword(e.target.value)} disabled={loading}/>
                        <div className={styles.container_from_content}>
                            <img className={styles.content__img} src={hide_password} onClick={() => {
                                setInpytType(prev => (prev === 'password' ? 'text' : 'password'))
                            }}/>
                        </div>
                    </div>
                    {error && <p className={styles.auth__container_from_error}>{error}</p>}
                    <button type="submit" className={styles.auth__container_from_btn} disabled={loading}>
                        {loading ? "Loading..." : (authtype === "login" ? "LOGIN!" : "REGISTER!")}</button>
                </form>
                {authtype === "login" ? (
                    <p className={styles.auth__container_text} onClick={() =>
                        setAuthtype("register")}>Don't have an account? Register</p>
                ) : (
                    <p className={styles.auth__container_text} onClick={() =>
                        setAuthtype("login")}>Already have an account? Login</p>
                )}
            </div>
        </div>
    );
}