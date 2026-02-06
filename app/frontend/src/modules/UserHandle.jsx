import styles from '../../../../assets/styles/userhandle.module.css';
import success_ico from '../../../../assets/img/iu/success_icon.png';
import error_ico from '../../../../assets/img/iu/error_icon.png';
import { GetUsername, UpdateUsername } from "../../wailsjs/go/auth/AuthService.js";
import {useEffect, useState} from "react";

import chummy_mood_ico from '../../../../assets/img/mood/mood_chummy.png'
import palsy_mood_ico from '../../../../assets/img/mood/mood_palsy.png'
import chipper_mood_ico from '../../../../assets/img/mood/mood_chipper.png'
import bully_mood_ico from '../../../../assets/img/mood/mood_bully.png'
import peppy_mood_ico from '../../../../assets/img/mood/mood_peppy.png'
import rancorous_mood_ico from '../../../../assets/img/mood/mood_rancorous.png'

const moodIcons = {
    chummy: chummy_mood_ico,
    palsy: palsy_mood_ico,
    chipper: chipper_mood_ico,
    bully: bully_mood_ico,
    peppy: peppy_mood_ico,
    rancorous: rancorous_mood_ico,
};

export default function UserHandle( {mood} ) {
    const [username, setUsername] = useState("");
    const [prevUsername, setPrevUsername] = useState("");
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchUsername = async () => {
            const name = await GetUsername();
            setUsername(name);
            setPrevUsername(name);
        };
        fetchUsername();
    }, []);

    const showTempStatus = (type) => {
        if (type === 'success') {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 5000);
        }
        if (type === 'error') {
            setError(true);
            setTimeout(() => setError(false), 5000);
        }
    };

    const handleUpdate = async () => {
        if (username === prevUsername) return;

        try {
            await UpdateUsername(username);
            setPrevUsername(username);
            showTempStatus('success');
        } catch (err) {
            setUsername(prevUsername);
            showTempStatus('error');
        }
    };

    return (
        <div className={styles.handle}>
            <p className={styles.handle__title}>MYSHUMHANDLE:</p>
            <div className={styles.handle__controls}>
                <div className={styles.handle__mood}>
                    <img className={styles.handle__mood_img}
                         src={moodIcons[mood] ?? chummy_mood_ico}/>
                </div>
                <input className={styles.handle__input} value={username} onChange={(e) =>
                    setUsername(e.target.value)} onBlur={handleUpdate}/>
                <div className={styles.handle__mood}>
                    {success && <img className={styles.handle__mood_img} src={success_ico} />}
                    {error && <img className={styles.handle__mood_img} src={error_ico} />}
                </div>
            </div>
        </div>
    );
}