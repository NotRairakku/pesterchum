import styles from '../../../../assets/styles/userhandle.module.css';
import mood_ico from '../../../../assets/img/mood/mood_chummy.png'
import { GetUsername, UpdateUsername } from "../../wailsjs/go/auth/AuthService.js";
import {useEffect, useState} from "react";

export default function UserHandle() {
    const [username, setUsername] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsername = async () => {
            try {
                const name = await GetUsername();
                setUsername(name);
            } catch (err) {
                setError(err.message || err.toString() || 'Failed to load username');
            } finally {
                setLoading(false);
            }
        };
        fetchUsername();
    }, []);

    const handleUpdate = async () => {
        setError(null);
        try {
            await UpdateUsername(username);
        } catch (err) {
            setError(err.message || 'Failed to update username');
        }
    }

    return (
        <>
            <div className={styles.handle}>
                <p className={styles.handle__title}>MYSHUMHANDLE:</p>
                <div className={styles.handle__controls}>
                    <div className={styles.handle__mood}>
                        <img className={styles.handle__mood_img}  src={mood_ico} alt="mood"/>
                    </div>
                    <input
                        className={styles.handle__input}
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onBlur={handleUpdate}
                    />
                </div>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </>
    );
}