import { useEffect, useState } from "react";
import TopBar from "./modules/TopBar.jsx";
import Profile from "./modules/Profile.jsx";
import Auth from "./modules/Auth.jsx";
import Loader from "./modules/Loader.jsx";
import Client from "./modules/Client.jsx";
import style from "../../../assets/styles/app.module.css";
import {HasSession, GetUserData } from "../wailsjs/go/auth/Service.js";

import default_photo from "../../../assets/dev/john.jpg";


export default function App() {
    const [status, setStatus] = useState("loading");
    const [user, setUser] = useState(null);
    const [initDone, setInitDone] = useState(false);

    const loadUser = async () => {
        console.log("[App] loadUser start");
        try {
            const res = await GetUserData();

            const userData = {
                Username: res.username.trim() || "",
                Photo: res.photo || default_photo,
                Description: res.description || "",
                Mood: res.mood?.toLowerCase() || "chummy",
                Color: res.color || "#ffffff",
                Birthdate: res.birthdate || "",
                Address: res.address || "",
            };

            console.log("[App] User loaded:", userData);
            setUser(userData);
            setStatus("client");
        } catch (err) {
            console.error("[App] loadUser error → user", err);
            setUser(null);
            setStatus("auth");
        }
    };

    useEffect(() => {
        if (initDone) return;
        setInitDone(true);

        (async () => {
            console.log("[App] Initial check");
            try {
                const ok = await HasSession();
                console.log("[App] HasSession:", ok);
                if (!ok) {
                    setStatus("auth");
                    return;
                }
                await loadUser();
            } catch {
                setStatus("auth");
            }
        })();
    }, []);

    const STATUS_MAP = {
        login: <Loader />,
        client: <Client user={user} setUser={setUser}/>,
        profile: <Profile setStatus={setStatus} user={user} setUser={setUser}/>,
        auth: <Auth loadUser={loadUser}/>,
    }

    return (
        <div className={style.app}>
            <TopBar setStatus={setStatus} user={user} />
            <div className={style.app__container}>
                {STATUS_MAP[status]}
            </div>
        </div>
    );
}