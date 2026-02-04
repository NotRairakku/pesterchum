import { useEffect, useState } from "react";
import TopBar from "./modules/TopBar.jsx";
import Profile from "./modules/Profile.jsx";
import Help from "./modules/Help.jsx";
import Auth from "./modules/Auth.jsx";
import Loader from "./modules/Loader.jsx";
import Client from "./modules/Client.jsx";
import style from "../../../assets/styles/app.module.css";
import { HasSession } from "../wailsjs/go/auth/AuthService.js";

export default function App() {
    const [status, setStatus] = useState('loading');
    const [loading, setLoading] = useState(true);

    const STATUS_MAP = {
        loading: <Loader />,
        client: <Client />,
        profile: <Profile />,
        help: <Help setStatus={setStatus}/>,
        auth: <Auth setStatus={setStatus} />,
    };

    useEffect(() => {
        const checkSession = async () => {
            try {
                const ok = await HasSession();
                setStatus(ok ? "client" : "auth");
            } catch (err) {
                console.error("Error checking session:", err);
                setStatus("auth");
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    return (
        <div className={style.app}>
            <TopBar setStatus={setStatus} />
            {loading ? <Loader /> : STATUS_MAP[status]}
        </div>
    );
}