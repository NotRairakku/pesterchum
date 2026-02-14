import {Logout} from "../../wailsjs/go/auth/Service.js";

import styles from '../styles/app.module.css';


export default function ProfileSettings({setAppStatus, setUser }) {

    const handleLogout = async () => {
        try {
            await Logout();
            setAppStatus("auth");
            setUser(null);
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    return (
        <div className={styles.profile__section}>
            <button onClick={handleLogout}>stop pester</button>
        </div>
    )
};