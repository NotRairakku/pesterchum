import {Logout, UpdateAddress, UpdateBirthdate, UpdateColor, UpdateDescription} from "../../wailsjs/go/auth/Service.js";
import {useEffect, useState} from "react";

import styles from "../../../../assets/styles/app.module.css";

import success_ico from "../../../../assets/img/iu/success_icon.png";
import error_ico from "../../../../assets/img/iu/error_icon.png";
import {useMask} from "@react-input/mask";

export default function Profile({setStatus, user, setUser }) {
    const [photo, setPhoto] = useState(null);
    const [prevPhoto, setPrevPhoto] = useState(null);
    const [username, setUsername] = useState("");
    const [prevUsername, setPrevUsername] = useState("");
    const [description, setDescription] = useState("");
    const [prevDescription, setPrevDescription] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [prevBirthdate, setPrevBirthdate] = useState("");
    const [address, setAddress] = useState("");
    const [prevAddress, setPrevAddress] = useState("");
    const [color, setColor] = useState("");
    const [prevColor, setPrevColor] = useState("");
    const [colorStatus, setColorStatus] = useState({ success: false, error: false });
    const [descStatus, setDescStatus] = useState({ success: false, error: false });
    const [birthStatus, setBirthStatus] = useState({ success: false, error: false });
    const [addressStatus, setAddressStatus] = useState({ success: false, error: false });


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

        if (user?.Description) {
            setDescription(user.Description);
            setPrevDescription(user.Description)
        } else {
            setDescription("");
            setPrevDescription("")
        }

        if (user?.Birthdate) {
            setBirthdate(user.Birthdate);
            setPrevBirthdate(user.Birthdate);
        } else {
            setBirthdate("");
            setBirthdate("")
        }

        if (user?.Address) {
            setAddress(user.Address);
            setPrevAddress(user.Address);
        } else {
            setAddress("");
            setPrevAddress("")
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


    const handleLogout = async () => {
        try {
            await Logout();
            setStatus('auth');
        } catch (err) {
            console.error("Logout failed:", err);
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


    const handleDescriptionUpdate = async () => {
        if (description === prevDescription) return;

        try {
            await UpdateDescription(description);
            setPrevDescription(description);
            setUser((prev) => ({ ...prev, Description: description }));
            showTempStatus(setDescStatus, 'success');
        } catch {
            setDescription(prevDescription);
            showTempStatus(setDescStatus, 'error');
        }
    }

    const handleBirthDateUpdate = async () => {
        if (birthdate === prevBirthdate) return;

        try {
            await UpdateBirthdate(birthdate);
            setPrevBirthdate(birthdate);
            setUser((prev) => ({ ...prev, Birthdate: birthdate }));
            showTempStatus(setBirthStatus, 'success');
        } catch {
            setBirthdate(prevBirthdate);
            showTempStatus(setBirthStatus, 'error');
        }
    }

    const handleAddressUpdate = async () => {
        if (address === prevAddress) return;

        try {
            await UpdateAddress(address);
            setPrevAddress(address);
            setUser((prev) => ({ ...prev, Address: address }));
            showTempStatus(setAddressStatus,'success');
        } catch {
            setAddress(prevAddress);
            showTempStatus(setAddressStatus,'error');
        }
    }

    const inputRef = useMask({
        mask: "#******", // # фиксирован, 6 символов
        replacement: {
            "*": /[0-9a-fA-F]/, // HEX символы
        },
    });

    return (
        <div className={styles.profile}>
            <div className={styles.profile__container}>
                <div className={styles.profile__container_user}>
                    <img className={styles.user__photo} src={photo} />
                    <div className={styles.user__container}>
                        <button onClick={handleLogout}>stop pester</button>
                        <p className={styles.user__container_name} style={{ color: color }}>{username}</p>
                        <input className={styles.user__container_input} type={'file'} accept={'image/*'}/>
                        <div className={styles.user__container_color}>
                            <input
                                className={styles.container_color_input}
                                type="text"
                                ref={inputRef}
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                onBlur={handleColorUpdate}
                            />

                            <div className={styles.container_color_status}>
                                {colorStatus.success && <img className={styles.status__img} src={success_ico} />}
                                {colorStatus.error && <img className={styles.status__img} src={error_ico} />}
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
                                    {descStatus.success && <img className={styles.status__img} src={success_ico} />}
                                    {descStatus.error && <img className={styles.status__img} src={error_ico} />}
                                </div>
                            </div>
                            <div className={styles.section__container}>
                                <input className={styles.section__container_input} type={"text"} value={birthdate}
                                    placeholder={'april 13 :D'}   onChange={(e) =>
                                    setBirthdate(e.target.value)} onBlur={handleBirthDateUpdate}/>
                                <div className={styles.section__container_status}>
                                    {birthStatus.success && <img className={styles.status__img} src={success_ico} />}
                                    {birthStatus.error && <img className={styles.status__img} src={error_ico} />}
                                </div>
                            </div>
                            <div className={styles.section__container}>
                                <input className={styles.section__container_input} type={"text"} value={address}
                                    placeholder={'your address'}   onChange={(e) =>
                                    setAddress(e.target.value)} onBlur={handleAddressUpdate}/>
                                <div className={styles.section__container_status}>
                                    {addressStatus.success && <img className={styles.status__img} src={success_ico} />}
                                    {addressStatus.error && <img className={styles.status__img} src={error_ico} />}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.section}>
                        <p className={styles.section__title}>AddPesterFriend:</p>
                        <div className={styles.section__container}>
                            <input className={styles.section__container_input} type={"text"} placeholder={'Pestername'}/>
                            <div className={styles.section__container_status}>
                                {/*{success && <img className={styles.status__img} src={success_ico} />}*/}
                                {/*{error && <img className={styles.status__img} src={error_ico} />}*/}
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