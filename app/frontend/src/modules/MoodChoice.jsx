import styles from '../styles/app.module.css';

import mood_ico from '../../../../assets/img/mood/mood_chummy.png'
import rancorous_mood_ico from '../../../../assets/img/mood/mood_rancorous.png'
import arrow_icon from '../../../../assets/img/iu/arrow_icon.svg'

import { UpdateMood } from "../../wailsjs/go/auth/Service.js"

export default function MoodChoice( { mood: propMood, setMood } ) {
    const mood = propMood?.toLowerCase() || "chummy";
    const currentMood = mood;

    const handleChange = async (e) => {
        const newMood = e.target.value.toLowerCase();
        setMood(newMood);

        try {
            await UpdateMood(newMood);
        } catch {
            setMood(currentMood);
        }
    };

    return (
        <div className={styles.mood}>
            <p className={styles.section__title}>MOOD:</p>
            <form className={styles.mood__form}>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="chummy"  checked={mood === 'chummy'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn__img} src={mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>CHUMMY</p>
                    <div className={styles.mood__selected}>
                        <img className={styles.btn__img_arrow} src={arrow_icon} alt={'&#10003;'} />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="palsy" checked={mood === 'palsy'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn__img} src={mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>PALSY</p>
                    <div className={styles.mood__selected}>
                        <img className={styles.btn__img_arrow} src={arrow_icon} alt={'&#10003;'} />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="chipper" checked={mood === 'chipper'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn__img} src={mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>CHIPPER</p>
                    <div className={styles.mood__selected}>
                        <img className={styles.btn__img_arrow} src={arrow_icon} alt={'&#10003;'} />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="bully" checked={mood === 'bully'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn__img} src={mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>BULLY</p>
                    <div className={styles.mood__selected}>
                        <img className={styles.btn__img_arrow} src={arrow_icon} alt={'&#10003;'} />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="peppy" checked={mood === 'peppy'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn__img} src={mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>PEPPY</p>
                    <div className={styles.mood__selected}>
                        <img className={styles.btn__img_arrow} src={arrow_icon} alt={'&#10003;'} />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="rancorous" checked={mood === 'rancorous'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn__img} src={rancorous_mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>RANCOROUS</p>
                    <div className={styles.mood__selected}>
                        <img className={styles.btn__img_arrow} src={arrow_icon} alt={'&#10003;'} />
                    </div>
                </label>
            </form>
        </div>
    )
}