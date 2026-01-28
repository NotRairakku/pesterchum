import { getCurrentWindow } from '@tauri-apps/api/window';
import style from '../styles/topbar.module.css';

import close_icon from '../assets/img/close_icon.png'
import minimize_icon from '../assets/img/minimize_icon.png'
import {useEffect} from "react";

export default function TopBar() {
    useEffect(() => {
        const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

        if (!isTauri) return;

        const appWindow = getCurrentWindow();

        const setWindowPosition = appWindow.onCloseRequested(async () => {
            const position = await appWindow.outerPosition();
            localStorage.setItem("window-position", JSON.stringify(position));
        });

        return () => {
            setWindowPosition.then(setPosition => setPosition());
        };
    }, []);

    const appWindow = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
            ? getCurrentWindow() : null;

    return (
        <div data-tauri-drag-region className={style.topbar}>
            <div className={style.topbar__container} data-tauri-drag-region>
                <p className={style.topbar__container_bnt}>CLIENT</p>
                <p className={style.topbar__container_bnt}>PROFILE</p>
                <p className={style.topbar__container_bnt}>HELP</p>
            </div>
            <div className={style.topbar__container}>
                <div className={style.topbar__container_bnt} onClick={() => appWindow.minimize()}>
                    <img className={style.bnt__icon} src={minimize_icon} alt={'-'}/>
                </div>
                <div className={style.topbar__container_bnt} onClick={() => appWindow.close()}>
                    <img className={style.bnt__icon} src={close_icon} alt={'X'}/>
                </div>
            </div>
        </div>
    );
}
