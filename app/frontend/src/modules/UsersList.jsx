import styles from '../styles/app.module.css';
import mood_ico from '../../../../assets/img/mood/mood_chummy.png'
import { useState } from "react";
import { OpenChat } from "../../wailsjs/go/main/App.js";

export default function UsersList( { friends, user } ) {
    const [selected, setSelected] = useState(null);

    const SelectFriend = (id) => {
        if (id === selected) return
        setSelected(id);
    }

    const StartPester = async () => {
        if (!selected) return
        if (!user?.UserID) return

        try {
            await OpenChat(user.UserID, selected);
            console.log('[UserList] chat open:', selected);
        } catch (error) {
            console.error('[UserList] error', error);
            if (error?.message?.includes('already open')) {
                console.log('[UserList] chat already open');
            }
        }
    };

    return (
        <div className={styles.list}>
            <p className={styles.section__title}>CHUMROLL:</p>
            <div className={styles.list__content}>
                {friends.length === 0 && (<p className={styles.list__content_empty}>no chums yet</p>)}

                {friends.map(friend => (
                    <div key={friend.id} className={`${styles.list__container_tile}
                    ${friend.id === selected ? styles.list__container_tile_selected : ''}`}
                         onClick={() => SelectFriend(friend.id)}>
                        <img className={styles.tile__mood} src={mood_ico} alt={friend.mood}/>
                        <p className={styles.tile__name}>{friend.username}</p>
                    </div>
                ))}
            </div>
            <div className={styles.list__btns}>
                <div className={styles.list__btn} onClick={StartPester}>PESTER!</div>
            </div>
        </div>
    )
}