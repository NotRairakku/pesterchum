import { Logout } from "../../wailsjs/go/auth/AuthService.js";

export default function Help({ setStatus }) {
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