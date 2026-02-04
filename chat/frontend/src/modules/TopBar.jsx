import style from '../../../../assets/styles/topbar.module.css';
import close_icon from '../../../../assets/img/close_icon.png'
import minimize_icon from '../../../../assets/img/minimize_icon.png'
import mood_icon from '../../../../assets/img/mood/mood_chipper.png'

import {
    WindowMinimise,
    Quit
} from "../../wailsjs/runtime/runtime";

export default function TopBar({DisplayUserName}) {

    return (
        <div className={style.topbar}>
            <div className={style.topbar__container_title}>
                <img src={mood_icon} alt={'mood'}/>
                <p className={style.topbar__container_text}>{DisplayUserName}</p>
            </div>
            <div className={style.topbar__container}>
                <div className={style.topbar__container_btn}  onClick={WindowMinimise}>
                    <img className={style.bnt__icon} src={minimize_icon} alt={'-'}/>
                </div>
                <div className={style.topbar__container_btn}  onClick={Quit}>
                    <img className={style.bnt__icon} src={close_icon} alt={'X'}/>
                </div>
            </div>
        </div>
    );
}
