import styles from '../styles/app.module.css';
import banner from "../../../../assets/img/pesterchum-logo.png";

export default function Banner() {
    return (
        <div className={styles.banner}>
            <div className={styles.banner__container}>
                <p className={styles.banner__container_title}>PESTERCHUM 6.0</p>
                <div className={styles.banner__banner}>
                    <img className={styles.banner__banner_sprite} src={banner} alt="banner"/>
                    <div className={styles.banner__banner_container}>
                        <p className={styles.banner__banner_text}>CHAT CLIENT</p>
                    </div>
                </div>
            </div>
        </div>
    )
}