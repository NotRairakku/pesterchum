import styles from '../../../../assets/styles/moodchoice.module.css';
import mood_ico from '../../../../assets/img/mood/mood_chummy.png'
import mood_ico_rancorous from '../../../../assets/img/mood/mood_rancorous.png'


export default function MoodChoice() {
    return (
        <>
            <div className={styles.mood}>
                <p className={styles.mood__title}>MOOD:</p>
                <form className={styles.mood__form}>
                    <label className={styles.section__btn}>
                        <div className={styles.section__btn_img}>
                            <img className={styles.btn_img} src={mood_ico} alt="mood" />
                        </div>
                        <p className={styles.btn__text}>CHUMMY</p>
                        <input className={styles.btn__input} type="radio" name="mood" value="chummy"/>
                    </label>
                    <label className={styles.section__btn}>
                        <div className={styles.section__btn_img}>
                            <img className={styles.btn_img} src={mood_ico} alt="mood" />
                        </div>
                        <p className={styles.btn__text}>PALSY</p>
                        <input className={styles.btn__input} type="radio" name="mood" value="palsy"/>
                    </label>
                    <label className={styles.section__btn}>
                        <div className={styles.section__btn_img}>
                            <img className={styles.btn_img} src={mood_ico} alt="mood" />
                        </div>
                        <p className={styles.btn__text}>CHIPPER</p>
                        <input className={styles.btn__input} type="radio" name="mood" value="chipper"/>
                    </label>
                    <label className={styles.section__btn}>
                        <div className={styles.section__btn_img}>
                            <img className={styles.btn_img} src={mood_ico} alt="mood" />
                        </div>
                        <p className={styles.btn__text}>BULLY</p>
                        <input className={styles.btn__input} type="radio" name="mood" value="bully"/>
                    </label>
                    <label className={styles.section__btn}>
                        <div className={styles.section__btn_img}>
                            <img className={styles.btn_img} src={mood_ico} alt="mood" />
                        </div>
                        <p className={styles.btn__text}>PEPPY</p>
                        <input className={styles.btn__input} type="radio" name="mood" value="peppy"/>
                    </label>
                    <label className={styles.section__btn}>
                        <div className={styles.section__btn_img}>
                            <img className={styles.btn_img} src={mood_ico_rancorous} alt="mood" />
                        </div>
                        <p className={styles.btn__text}>RANCOROUS</p>
                        <input className={styles.btn__input} type="radio" name="mood" value="rancorous"/>
                    </label>
                    {/*<label className={`${styles.section__btn} ${styles.full}`}>*/}
                    {/*    <p className={styles.btn__text}>ABSCOND</p>*/}
                    {/*    <input className={styles.btn__input} type="radio" name="mood" value="rancorous" />*/}
                    {/*</label>*/}
                </form>
            </div>
        </>
    )
}