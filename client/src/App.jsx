import List from "./modules/List.jsx";
import TopBar from "./modules/TopBar.jsx";
import style from "./styles/app.module.css";
import banner from './assets/img/pesterchum-logo.png';
import UserHandle from "./modules/UserHandle.jsx";
import MoodChoice from "./modules/MoodChoice.jsx";

export default function App() {
    return (
        <>
            <TopBar/>
            <div className={style.app}>
                <div className={style.app__container}>
                    <p className={style.app__container_title}>PESTERCHUM 6.0</p>
                    <div className={style.app__banner}>
                        <img className={style.app__banner_sprite} src={banner} alt="banner"/>
                        <div className={style.app__banner_container}>
                            <p className={style.app__banner_text}>CHAT CLIENT</p>
                        </div>
                    </div>
                </div>
                <List/>
                <UserHandle/>
                <MoodChoice/>
            </div>
        </>
    )
}
