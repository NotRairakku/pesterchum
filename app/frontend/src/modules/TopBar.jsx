import style from '../styles/topbar.module.css';
import close_icon from '../assets/img/close_icon.png'
import minimize_icon from '../assets/img/minimize_icon.png'

import { Window } from '@wailsio/runtime';

export default function TopBar({ setSection }) {

    return (
        <div className={style.topbar}>
            <div className={style.topbar__container}>
                <p className={style.topbar__container_bnt} onClick={() => setSection("client")}>CLIENT</p>
                <p className={style.topbar__container_bnt} onClick={() => setSection("profile")}>PROFILE</p>
                <p className={style.topbar__container_bnt} onClick={() => setSection("help")}>HELP</p>
            </div>
            <div className={style.topbar__container}>
                <div className={style.topbar__container_bnt} onClick={() => Window.Minimise()}>
                    <img className={style.bnt__icon} src={minimize_icon} alt={'-'}/>
                </div>
                <div className={style.topbar__container_bnt} onClick={() => Window.Close()}>
                    <img className={style.bnt__icon} src={close_icon} alt={'X'}/>
                </div>
            </div>
        </div>
    );
}
