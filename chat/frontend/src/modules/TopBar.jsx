import { WindowMinimise, Quit } from "../../wailsjs/runtime/runtime";

import styles from '../styles/chat.module.css';
import close_btn_icon from '../../../../assets/img/iu/close_btn_icon.png'
import minimize_btn_icon from '../../../../assets/img/iu/minimize_btn_icon.png'
import mood_icon from '../../../../assets/img/mood/mood_chipper.png'

export default function TopBar() {

    return (
        <div className={styles.topbar}>
            <div className={styles.topbar__container_title}>
                <img className={styles.topbar__container_image} src={mood_icon} alt={'mood'}/>
                <p className={styles.topbar__container_text}>PESTERLOG</p>
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
