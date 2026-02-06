import Banner from "./Banner.jsx";
import UsersList from "./UsersList.jsx";
import UserHandle from "./UserHandle.jsx";
import MoodChoice from "./MoodChoice.jsx";
import {useState} from "react";

export default function Client() {
    const [mood, setMood] = useState("");

    return (
        <>
            <Banner/>
            <UsersList/>
            <UserHandle mood={mood}/>
            <MoodChoice mood={mood} setMood={setMood}/>
        </>
    )
}