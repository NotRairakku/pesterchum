import styles from '../../../../assets/styles/userhandle.module.css';
import mood_ico from '../../../../assets/img/mood/mood_chummy.png'

export default function UserHandle() {
    return (
        <>
            <div className={styles.handle}>
                <p className={styles.handle__title}>MYSHUMHANDLE:</p>
                <div className={styles.handle__controls}>
                    <div className={styles.handle__mood}>
                        <img className={styles.handle__mood_img}  src={mood_ico} alt="mood"/>
                    </div>
                    <input className={styles.handle__input} type="text" name="" id=""/>
                </div>
            </div>
        </>
    );
}