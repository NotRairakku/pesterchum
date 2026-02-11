import styles from "../../../../assets/styles/app.module.css";

import {Logout} from "../../wailsjs/go/auth/Service.js";

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