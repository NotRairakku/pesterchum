import {Logout} from "../../wailsjs/go/auth/Service.js";
import {useEffect, useState} from "react";

import styles from "../../../../assets/styles/app.module.css";

import john_photo from "../../../../assets/dev/john.jpg";
import success_ico from "../../../../assets/img/iu/success_icon.png";
import error_ico from "../../../../assets/img/iu/error_icon.png";
import mood_ico from "../../../../assets/img/mood/mood_chummy.png";

export default function Profile({setStatus, user, setUser }) {
    const [photo, setPhoto] = useState(null);
    const [prevPhoto, setPrevPhoto] = useState(null);
    const [username, setUsername] = useState("");
    const [prevUsername, setPrevUsername] = useState("");
    const [description, setDescription] = useState("");
    const [prevDescription, setPrevDescription] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [prevBirthDate, setPrevBirthDate] = useState("");
    const [address, setAddress] = useState("");
    const [prevAddress, setPrevAddress] = useState("");
    const [color, setColor] = useState("");
    const [prevColor, setPrevColor] = useState("");
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (user?.Photo) {
            setPhoto(user.Photo);
            setPrevPhoto(user.Photo);
        } else {
            setPhoto(john_photo);
            setPrevPhoto(john_photo);
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

        if (user?.Description) {
            setDescription(user.Description);
            setPrevDescription(user.Description)
        } else {
            setDescription("");
            setPrevDescription("")
        }

        if (user?.BirthDate) {
            setBirthDate(user.BirthDate);
            setPrevBirthDate(user.BirthDate);
        } else {
            setBirthDate("");
            setBirthDate("")
        }

        if (user?.Address) {
            setAddress(user.Address);
            setPrevAddress(user.Address);
        } else {
            setAddress("");
            setPrevAddress("")
        }
    }, [user]);

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

    const handleLogout = async () => {
        try {
            await Logout();
            setStatus('auth');
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const handleDescriptionUpdate = async () => {
        console.log('ok')
    }

    const handleColorUpdate = async () => {
        console.log('ok')
    }

    const handleBirthDateUpdate = async () => {
        console.log('ok')
    }

    const handleAddressUpdate = async () => {
        console.log('ok')
    }

    return (
        <div className={styles.profile}>
            <div className={styles.profile__container}>
                <div className={styles.profile__container_user}>
                    <img className={styles.user__photo} src={photo} />
                    <div className={styles.user__container}>
                        <button onClick={handleLogout}>stop pester</button>
                        <p className={styles.user__container_name}>{username}</p>
                        <input className={styles.user__container_input} type={'file'} accept={'image/*'}/>
                        <div className={styles.user__container_color}>
                            <input className={styles.container_color_input} type={"text"} max={'7'} min={'7'} value={color} onChange={(e) =>
                                setColor(e.target.value)} onBlur={handleColorUpdate}/>
                            <div className={styles.container_color_status}>
                                {success && <img className={styles.status__img} src={success_ico} />}
                                {error && <img className={styles.status__img} src={error_ico} />}
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.profile__container_section}>
                    <div className={styles.section}>
                        <p className={styles.section__title}>Pesterdata:</p>
                        <div className={styles.section__content}>
                            <div className={styles.section__container}>
                                <input className={styles.section__container_input} type={"text"} value={description}
                                    placeholder={'About you here'} onChange={(e) =>
                                    setDescription(e.target.value)} onBlur={handleDescriptionUpdate}/>
                                <div className={styles.section__container_status}>
                                    {success && <img className={styles.status__img} src={success_ico} />}
                                    {error && <img className={styles.status__img} src={error_ico} />}
                                </div>
                            </div>
                            <div className={styles.section__container}>
                                <input className={styles.section__container_input} type={"text"} value={birthDate}
                                    placeholder={'april 13 :D'}   onChange={(e) =>
                                    setBirthDate(e.target.value)} onBlur={handleBirthDateUpdate}/>
                                <div className={styles.section__container_status}>
                                    {success && <img className={styles.status__img} src={success_ico} />}
                                    {error && <img className={styles.status__img} src={error_ico} />}
                                </div>
                            </div>
                            <div className={styles.section__container}>
                                <input className={styles.section__container_input} type={"text"} value={address}
                                    placeholder={'your address'}   onChange={(e) =>
                                    setAddress(e.target.value)} onBlur={handleAddressUpdate}/>
                                <div className={styles.section__container_status}>
                                    {success && <img className={styles.status__img} src={success_ico} />}
                                    {error && <img className={styles.status__img} src={error_ico} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.section}>
                        <p className={styles.section__title}>AddPesterFriend:</p>
                        <div className={styles.section__container}>
                            <input className={styles.section__container_input} type={"text"} placeholder={'Pestername'}/>
                            <div className={styles.section__container_status}>
                                {success && <img className={styles.status__img} src={success_ico} />}
                                {error && <img className={styles.status__img} src={error_ico} />}
                            </div>
                        </div>
                    </div>
                    <div className={styles.request}>
                        <p className={styles.section__title}>Pesterrequests:</p>
                        <div className={styles.request__content}>
                            <div className={styles.request__container}>
                                <div className={styles.request__container_tile}>
                                    <p className={styles.tile__name}>tentacleTherapist</p>
                                    <div className={styles.tile__container}>
                                        <button className={styles.tile__container_btn}>yes</button>
                                        <button className={styles.tile__container_btn}>no</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={styles.profile__container_btns}>
                </div>
            </div>
        </div>
    );
}