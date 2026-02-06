import style from '../../../../assets/styles/topbar.module.css';
import close_icon from '../../../../assets/img/iu/close_icon.png'
import minimize_icon from '../../../../assets/img/iu/minimize_icon.png'
import { WindowMinimise, Quit } from "../../wailsjs/runtime/runtime";

export default function TopBar({ setStatus, user }) {

    return (
        <div className={style.topbar}>
            <div className={style.topbar__container}>
                <div className={style.topbar__container__btns}>
                    <p className={style.topbar__container_btn} onClick={() => setStatus("client")}>CLIENT</p>
                    <p className={style.topbar__container_btn} onClick={() => setStatus("profile")}>PROFILE</p>
                    <p className={style.topbar__container_btn} onClick={() => setStatus("help")}>HELP</p>
                </div>
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
