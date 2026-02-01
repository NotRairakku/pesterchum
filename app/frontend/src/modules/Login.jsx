import { useState } from 'react';
import { login } from "../api/auth.js"

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const onSubmit = async () => {
        try {
            const sessionId = await login(username, password);
            localStorage.setItem("session_id", sessionId);
        } catch (err) {
            console.error(err);
            alert(`Failed to login session: ${err}`);
        }
    }

    return (
        <>
            <input onChange={e => setUsername(e.target.value)} />
            <input type="password" onChange={e => setPassword(e.target.value)} />
            <button onClick={onSubmit}>Login</button>
        </>
    )
}