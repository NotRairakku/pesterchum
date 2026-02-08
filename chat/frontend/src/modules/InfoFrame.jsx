import styles from '../../../../assets/styles/app.module.css';

import photo from '../../../../assets/dev/john.jpg';

export default function InfoFrame() {
    return (
        <div className={styles.info}>
            <div  className={styles.info__container}>
                <p className={styles.info__container_text}>ectoBiologist</p>
            </div>
            <div className={styles.info__container}>
                <div className={styles.info__container_photo}>
                    <img className={styles.photo__img} src={photo}/>
                </div>
                <div className={styles.info__container_menu}>
                    <div className={styles.menu__message}>
                        <p className={styles.menu__message_text}>it`s my birthday ans i`m sick of cake.</p>
                    </div>
                    <div className={styles.menu__container}>
                        <div className={styles.menu__container_bio}>
                            <div className={styles.bio__container}>
                                <img className={styles.bio__container_img}/>
                                <p className={styles.bio__container_text}>april 13</p>
                            </div>
                            <div className={styles.bio__container}>
                                <img className={styles.bio__container_img}/>
                                <p className={styles.bio__container_text}>a suburban neighborhood</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}