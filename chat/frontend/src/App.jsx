import TopBar from "./modules/TopBar.jsx";
import style from "../../../assets/styles/chat.module.css";
import MessageFrame from "./modules/MessageFrame.jsx";
import InputMessage from "./modules/InputMessage.jsx";
import InfoFrame from "./modules/InfoFrame.jsx";


export default function App() {
    return (
        <div className={style.chat}>
            <TopBar/>
            <div className={style.chat__container}>
                <InfoFrame/>
                <MessageFrame/>
                <InputMessage/>
            </div>
        </div>
    );
}
