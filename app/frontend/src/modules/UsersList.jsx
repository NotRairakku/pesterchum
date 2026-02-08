import styles from '../../../../assets/styles/app.module.css'

import mood_ico from '../../../../assets/img/mood/mood_chummy.png'

export default function UsersList() {
    return (
        <div className={styles.list}>
            <p className={styles.section__title}>CHUMROLL:</p>
            <div className={styles.list__content}>
                <div className={styles.list__container}>
                    <div className={styles.list__container_tile}>
                        <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                        <p className={styles.tile_name}>turntechGodhead</p>{/*i am relly like dave... */}
                    </div>
                </div>
                <div className={styles.list__container}>
                    <div className={styles.list__container_tile}>
                        <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                        <p className={styles.tile_name}>ectoBiologist</p>
                    </div>
                </div>
                <div className={styles.list__container}>
                    <div className={styles.list__container_tile}>
                        <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                        <p className={styles.tile_name}>gardenGnostic</p>
                    </div>
                </div>
                <div className={styles.list__container}>
                    <div className={styles.list__container_tile}>
                        <img className={styles.tile__mood} src={mood_ico} alt="mood" />
                        <p className={styles.tile_name}>carcinoGeneticist</p>
                    </div>
                </div>
            </div>
            <div className={styles.list__btns}>
                <div className={styles.list__btn}>PESTER!</div>
            </div>
        </div>
    )
}