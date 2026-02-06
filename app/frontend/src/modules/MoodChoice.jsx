import styles from '../../../../assets/styles/moodchoice.module.css';
import selected_ico from '../../../../assets/img/iu/close_icon.png'

import chummy_mood_ico from '../../../../assets/img/mood/mood_chummy.png'
import palsy_mood_ico from '../../../../assets/img/mood/mood_palsy.png'
import chipper_mood_ico from '../../../../assets/img/mood/mood_chipper.png'
import bully_mood_ico from '../../../../assets/img/mood/mood_bully.png'
import peppy_mood_ico from '../../../../assets/img/mood/mood_peppy.png'
import rancorous_mood_ico from '../../../../assets/img/mood/mood_rancorous.png'

import {useEffect, useState} from "react";
import { GetMood, UpdateMood } from "../../wailsjs/go/auth/AuthService.js"

export default function MoodChoice( { mood, setMood } ) {
    const [prevMood, setPrevMood] = useState("");

    useEffect(() => {
        const fetchMood = async () => {
            const mood = await GetMood();
            setMood(mood);
            setPrevMood(mood);
        };
        fetchMood();
    }, []);

    const handleChange = async (e) => {
        const newMood = e.target.value;
        setMood(newMood);

        try {
            await UpdateMood(newMood);
            setPrevMood(newMood);
        } catch {
            setMood(prevMood);
        }
    };

    return (
        <div className={styles.mood}>
            <p className={styles.mood__title}>MOOD:</p>
            <form className={styles.mood__form}>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="chummy"  checked={mood === 'chummy'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn_img} src={chummy_mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>CHUMMY</p>
                    <div className={styles.mood__selected}>
                        <img src={selected_ico} alt="" />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="palsy" checked={mood === 'palsy'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn_img} src={palsy_mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>PALSY</p>
                    <div className={styles.mood__selected}>
                        <img src={selected_ico} alt="" />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="chipper" checked={mood === 'chipper'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn_img} src={chipper_mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>CHIPPER</p>
                    <div className={styles.mood__selected}>
                        <img src={selected_ico} alt="" />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="bully" checked={mood === 'bully'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn_img} src={bully_mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>BULLY</p>
                    <div className={styles.mood__selected}>
                        <img src={selected_ico} alt="" />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="peppy" checked={mood === 'peppy'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn_img} src={peppy_mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>PEPPY</p>
                    <div className={styles.mood__selected}>
                        <img src={selected_ico} alt="" />
                    </div>
                </label>
                <label className={styles.section__btn}>
                    <input className={styles.btn__input} type="radio" name="mood"
                           value="rancorous" checked={mood === 'rancorous'} onChange={handleChange}/>
                    <div className={styles.section__btn_img}>
                        <img className={styles.btn_img} src={rancorous_mood_ico} alt="mood" />
                    </div>
                    <p className={styles.btn__text}>RANCOROUS</p>
                    <div className={styles.mood__selected}>
                        <img src={selected_ico} alt="" />
                    </div>
                </label>
            </form>
        </div>
    )
}