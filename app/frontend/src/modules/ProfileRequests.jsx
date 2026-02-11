import styles from "../../../../assets/styles/app.module.css";
import { AnswerFriendRequest, CreateFriendRequest } from "../../wailsjs/go/auth/Service.js";
import { useState } from "react";

export default function ProfileRequests({ setFriends, friendsRequests, setFriendsRequests }) {
    const [friendName, setFriendName] = useState("");

    const handleAnswer = async (id, accept) => {
        if (!id) return;

        try {
            await AnswerFriendRequest(id, accept);

            const reqUser = friendsRequests.find(r => r.id === id);

            setFriendsRequests(prev => prev.filter(r => r.id !== id));

            if (accept && reqUser) {
                setFriends(prev => [
                    ...prev,
                    { ID: reqUser.id, Username: reqUser.name, Mood: "chummy" }
                ]);
            }

        } catch (e) {
            console.error("Answer error:", e);
        }
    };

    const handleAdd = async () => {
        const name = friendName.trim();
        if (!name) return;

        try {
            await CreateFriendRequest(name);
            setFriendName("");
        } catch (e) {
            console.error("Create error:", e);
        }
    };

    return (
        <div className={styles.profile__section}>
            <div className={styles.section}>
                <p className={styles.section__title}>Add PesterFriend:</p>
                <div className={styles.section__container}>
                    <input className={styles.section__container_input} type="text" placeholder="Pestername" value={friendName}
                           onChange={e => setFriendName(e.target.value)}/>
                    <button onClick={handleAdd}>Add friend</button>
                </div>
            </div>

            <div className={styles.request}>
                <p className={styles.section__title}>Pesterrequests:</p>
                <div className={styles.request__content}>
                    <div className={styles.request__container}>
                        {friendsRequests.map(r => (
                            <div key={r.id}>
                                <p>{r.name}</p>
                                <button onClick={() => handleAnswer(r.id, true)}>yes</button>
                                <button onClick={() => handleAnswer(r.id, false)}>no</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
