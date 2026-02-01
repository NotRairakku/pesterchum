import { useState } from "react";
import TopBar from "./modules/TopBar.jsx";
import Client from "./modules/Client.jsx";
import Profile from "./modules/Profile.jsx";
import Help from "./modules/Help.jsx";
import style from "./styles/app.module.css";

export default function App() {
    const [auth, setAuth] = useState("");
    const [section, setSection] = useState("client");

    return (
        <div className={style.app}>
            <TopBar setSection={setSection} />
            {section === "client" && <Client />}
            {section === "profile" && <Profile />}
            {section === "help" && <Help />}
        </div>
    )
}
