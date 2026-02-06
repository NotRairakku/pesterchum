import { Logout } from "../../wailsjs/go/auth/Service.js";

export default function Help({ setStatus, user, setUser }) {
    const handleLogout = async () => {
        try {
            await Logout();
            setStatus('auth');
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <>
            <button onClick={handleLogout}>Exit for your account</button>
        </>
    );
}