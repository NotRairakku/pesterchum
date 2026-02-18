import { useState } from "react";
import { Login, Register } from "../../wailsjs/go/auth/Service.js";

import styles from "../styles/app.module.css";
import words from "../../../../assets/words.json"
import logo from "../../../../assets/img/pesterchum-logo.png";
import random_name_ico from "../../../../assets/img/iu/randomize_ico.png";
import password_ico from "../../../../assets/img/iu/password_ico.png";
import password_show_ico from "../../../../assets/img/iu/password_show_ico.png";

export default function Auth({ loadUser }) {
    const [authtype, setAuthtype] = useState("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [inputType, setInputType] = useState('password');
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
        if (!words.list.length) return '';
        const firstPart = words.list[Math.floor(Math.random() * words.list.length)];
        let second = Math.floor(Math.random() * words.list.length);
        while (
            second < words.list.length && words.list[second] === firstPart && words.list.length > 1) {
            second = Math.floor(Math.random() * words.list.length);
        }
        const secondPart = words.list[second][0].toUpperCase() + words.list[second].slice(1);
        return firstPart + secondPart;  //percentage of name receipt ectoBiologist = 0,01% :D
    };

    const currentIcon = inputType === 'password' ? password_ico : password_show_ico;

    const togglePasswordVisibility = () => {
        setInputType(prev => (prev === 'password' ? 'text' : 'password'));
    };

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
                            {authtype === "login" ? null : (
                                <img className={styles.content__img} src={random_name_ico} onClick={() => setUsername(GenRandomName())}/>
                            )}
                        </div>
                    </div>
                    <div className={styles.container_from}>
                        <input className={styles.container_from_input} placeholder="Password"
                               type={inputType} value={password} onChange={(e) =>
                            setPassword(e.target.value)} disabled={loading}/>
                        <div className={styles.container_from_content}>
                            <img className={styles.content__img} src={currentIcon} onClick={() => {togglePasswordVisibility()}}/>
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