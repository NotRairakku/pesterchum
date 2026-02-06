import Banner from "./Banner.jsx";
import UsersList from "./UsersList.jsx";
import UserHandle from "./UserHandle.jsx";
import MoodChoice from "./MoodChoice.jsx";

export default function Client({ user, setUser }) {
    return (
        <>
            <Banner />
            <UsersList />
            <UserHandle user={user} setUser={setUser} />
            <MoodChoice
                mood={user?.Mood || "chummy"}
                setMood={(newMood) => setUser(prev => ({ ...prev, Mood: newMood }))}
            />
        </>
    )
}