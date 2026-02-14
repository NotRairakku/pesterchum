import styles from '../styles/app.module.css';
import mood_ico from '../../../../assets/img/mood/mood_chummy.png'

export default function UsersList( { friends } ) {

    return (
        <div className={styles.list}>
            <p className={styles.section__title}>CHUMROLL:</p>
            <div className={styles.list__content}>
                {friends.length === 0 && (<p className={styles.list__content_empty}>no chums yet</p>)}

                {friends.map(friend => (
                    <div key={friend.id} className={styles.list__container_tile}>
                        <img className={styles.tile__mood} src={mood_ico} alt={friend.mood}/>
                        <p className={styles.tile__name}>{friend.username}</p>
                    </div>
                ))}
            </div>
            <div className={styles.list__btns}>
                <div className={styles.list__btn}>PESTER!</div>
            </div>
        </div>
    )
}