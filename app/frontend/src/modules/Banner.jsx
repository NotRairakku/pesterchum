import style from "../styles/banner.module.css";
import banner from "../assets/img/pesterchum-logo.png";

export default function Banner() {
    return (
        <div className={style.banner}>
            <div className={style.banner__container}>
                <p className={style.banner__container_title}>PESTERCHUM 6.0</p>
                <div className={style.banner__banner}>
                    <img className={style.banner__banner_sprite} src={banner} alt="banner"/>
                    <div className={style.banner__banner_container}>
                        <p className={style.banner__banner_text}>CHAT CLIENT</p>
                    </div>
                </div>
            </div>
        </div>
    )
}