import { useEffect, useState } from "react";
import TopBar from "./modules/TopBar.jsx";
import Profile from "./modules/Profile.jsx";
import Help from "./modules/Help.jsx";
import Auth from "./modules/Auth.jsx";
import Loader from "./modules/Loader.jsx";
import Client from "./modules/Client.jsx";
import style from "../../../assets/styles/app.module.css";

export default function App() {
    const [status, setStatus] = useState('loading');
    const [loading, setLoading] = useState(true);

    const STATUS_MAP = {
        loading: <Loader />,
        client: <Client />,
        profile: <Profile />,
        help: <Help />,
        auth: <Auth setStatus={setStatus} />,
    };

    // проверка сессии при старте
    useEffect(() => {
        const checkSession = async () => {
            try {
                const ok = await window.runtime.invoke("AuthService.HasSession");
                setStatus(ok ? "client" : "auth");
            } catch {
                setStatus("auth");
            } finally {
                setLoading(false);
            }
        };
        checkSession();
    }, []);

    return (
        <div className={style.app}>
            <TopBar setStatus={setStatus} isLoading={loading} />
            {STATUS_MAP[status]}
        </div>
    );
}
