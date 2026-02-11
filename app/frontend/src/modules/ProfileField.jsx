import styles from "../../../../assets/styles/app.module.css";
import success_ico from "../../../../assets/img/iu/success_icon.png";
import error_ico from "../../../../assets/img/iu/error_icon.png";

import {useEffect, useState} from "react";
import {UpdateAddress, UpdateBirthdate, UpdateDescription} from "../../wailsjs/go/auth/Service.js";

export default function ProfileField({ user, setUser }) {
    const [description, setDescription] = useState("");
    const [prevDescription, setPrevDescription] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [prevBirthdate, setPrevBirthdate] = useState("");
    const [address, setAddress] = useState("");
    const [prevAddress, setPrevAddress] = useState("");
    const [descStatus, setDescStatus] = useState({ success: false, error: false });
    const [birthStatus, setBirthStatus] = useState({ success: false, error: false });
    const [addressStatus, setAddressStatus] = useState({ success: false, error: false });

    useEffect(() => {
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

    return (
        <div className={styles.profile__section}>
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
        </div>
    )
}