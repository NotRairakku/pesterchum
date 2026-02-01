import styles from '../styles/list.module.css'
import CustomScroll from "./CustomScroll.jsx";

import mood_ico from '../assets/img/mood/mood_chipper.png'

export default function UsersList() {
    return (
        <>
            <div className={styles.list}>
                <p className={styles.list__title}>CHUMROLL:</p>
                <CustomScroll height={168}>
                    <div className={styles.list__content}>
                        <div className={styles.list__container}>
                            <div className={styles.list__container_tile}>
                                <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                                <p className={styles.tile_name}>adiosToreador</p>
                            </div>
                            <div className={styles.list__container_tile}>
                                <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                                <p className={styles.tile_name}>adiosToreador</p>
                            </div>
                            <div className={styles.list__container_tile}>
                                <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                                <p className={styles.tile_name}>adiosToreador</p>
                            </div>
                            <div className={styles.list__container_tile}>
                                <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                                <p className={styles.tile_name}>adiosToreador</p>
                            </div>
                            <div className={styles.list__container_tile}>
                                <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                                <p className={styles.tile_name}>adiosToreador</p>
                            </div>
                            <div className={styles.list__container_tile}>
                                <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                                <p className={styles.tile_name}>adiosToreador</p>
                            </div>
                        </div>
                    </div>
                </CustomScroll>
                <div className={styles.list__btns}>
                    <div className={styles.list__btn}>ADD CHUM</div>
                    <div className={`${styles.list__btn} ${styles.list__btn_block}`}>BLOCK</div>
                    <div className={styles.list__btn}>PESTER!</div>
                </div>
            </div>
        </>
    )
}