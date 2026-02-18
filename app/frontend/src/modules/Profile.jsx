import { UpdateColor } from "../../wailsjs/go/auth/Service.js";
import {useEffect, useState} from "react";
import {useMask} from "@react-input/mask";
import ProfileField from "./ProfileField.jsx";
import ProfileSettings from "./ProfileSettings.jsx";
import ProfileRequests from "./ProfileRequests.jsx";

import styles from '../styles/app.module.css';
import success_ico from "../../../../assets/img/iu/success_icon.png";
import error_ico from "../../../../assets/img/iu/error_icon.png";

export default function Profile({ setAppStatus, user, setUser, friends, setFriends, friendsRequests, setFriendsRequests }) {
    const [profileState, setProfileState] = useState('filed')
    const [photo, setPhoto] = useState(null);
    const [prevPhoto, setPrevPhoto] = useState(null);
    const [username, setUsername] = useState("");
    const [prevUsername, setPrevUsername] = useState("");
    const [color, setColor] = useState("");
    const [prevColor, setPrevColor] = useState("");
    const [colorStatus, setColorStatus] = useState({ success: false, error: false });

    useEffect(() => {
        if (user?.Photo) {
            setPhoto(user.Photo);
            setPrevPhoto(user.Photo);
        } else {
            setPhoto("");
            setPrevPhoto("");
        }

        if (user?.Username) {
            setUsername(user.Username);
        } else {
            setUsername("");
        }

        if (user?.Color) {
            setColor(user.Color);
            setPrevColor(user.Color);
        } else {
            setColor("");
            setPrevColor("");
        }
    }, [user]);

    const showTempStatus = (setStatusFn, type) => {
        if (type === 'success') {
            setStatusFn(prev => ({ ...prev, success: true }));
            setTimeout(() => setStatusFn(prev => ({ ...prev, success: false })), 5000);
        }
        if (type === 'error') {
            setStatusFn(prev => ({ ...prev, error: true }));
            setTimeout(() => setStatusFn(prev => ({ ...prev, error: false })), 5000);
        }
    };

    const handleColorUpdate = async () => {
        if (color === prevColor || !/^#[0-9a-fA-F]{6}$/.test(color)) {
            setColor(prevColor);
            return;
        }

        try {
            await UpdateColor(color);
            setPrevColor(color);
            setUser(prev => ({ ...prev, Color: color }));
            showTempStatus(setColorStatus, 'success');
        } catch {
            setColor(prevColor);
            showTempStatus(setColorStatus, 'error');
        }
    };

    const inputRef = useMask({
        mask: "#******",
        replacement: {
            "*": /[0-9a-fA-F]/,
        },
    });

    const PROFILE_MAP = {
        filed: <ProfileField
            user={user}
            setUser={setUser}/>,
        requests: <ProfileRequests
            friendsRequests={friendsRequests}
            setFriendsRequests={setFriendsRequests}
            friends={friends}
            setFriends={setFriends}
        />,
        settings: <ProfileSettings
            setAppStatus={setAppStatus}
            setUser={setUser}/>,
    }

    return (
        <div className={styles.profile}>
            <div className={styles.profile__container}>
                <div className={styles.profile__container_user}>
                    <img className={styles.user__photo} src={photo} />
                    <div className={styles.user__container}>
                        <p className={styles.user__container_name} style={{ color: color }}>{username}</p>
                        <input className={styles.user__container_input} type={'file'} accept={'image/*'}/>
                        <div className={styles.user__container_color}>
                            <input className={styles.container_color_input} type="text" ref={inputRef} value={color} onChange={(e) => setColor(e.target.value)} onBlur={handleColorUpdate}/>
                            <div className={styles.container_color_status}>
                                {colorStatus.success && <img className={styles.status__img} src={success_ico} />}
                                {colorStatus.error && <img className={styles.status__img} src={error_ico} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.profile__container}>
                <div className={styles.profile__container_menu}>
                    <div className={styles.menu__button} onClick={(e) => setProfileState('filed')}>
                        <p className={styles.menu__button_text}>Field</p>
                    </div>
                    <div className={styles.menu__button} onClick={(e) => setProfileState('requests')}>
                        <p className={styles.menu__button_text}>Request</p>
                    </div>
                    <div className={styles.menu__button} onClick={(e) => setProfileState('settings')}>
                        <p className={styles.menu__button_text}>Settings</p>
                    </div>
                </div>
            </div>
            {PROFILE_MAP[profileState]}
        </div>
    );
}