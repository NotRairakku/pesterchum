import { WindowMinimise, Quit } from "../../wailsjs/runtime/runtime";

import styles from '../styles/app.module.css';
import close_btn_icon from '../../../../assets/img/iu/close_btn_icon.png'
import minimize_btn_icon from '../../../../assets/img/iu/minimize_btn_icon.png'
import pesterchum_logo from '../../../../assets/img/pesterchum-logo.png'

export default function TopBar({ setAppStatus, user }) {

    return (
        <div className={styles.topbar}>
            <div className={styles.topbar__container}>
                <div className={styles.topbar__container_title}>
                    <img className={styles.topbar__container_image} src={pesterchum_logo}/>
                    {user && <p className={styles.topbar__container_text} onClick={() =>
                        setAppStatus(prev => prev === "profile" ? "client" : "profile")}>
                        PESTERCHUM</p>}
                </div>
            </div>

            <div className={styles.topbar__container}>
                <div className={styles.topbar__container_btn}  onClick={WindowMinimise}>
                    <img className={styles.bnt__icon} src={minimize_btn_icon} alt={'-'}/>
                </div>
                <div className={styles.topbar__container_btn}  onClick={Quit}>
                    <img className={styles.bnt__icon} src={close_btn_icon} alt={'X'}/>
                </div>
            </div>
        </div>
    );
}
