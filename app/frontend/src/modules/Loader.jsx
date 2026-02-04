import logo from "../../../../assets/img/pesterchum-logo.png";
import styles from "../../../../assets/styles/loader.module.css";

export default function Loader() {
    return (
        <div className={styles.loader}>
            <div className={styles.loader__container}>
                <img className={styles.loader__container_logo} src={logo} alt={"logo"}/>
            </div>
        </div>
    )
}