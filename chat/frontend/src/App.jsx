import TopBar from "./modules/TopBar.jsx";
import MessageFrame from "./modules/MessageFrame.jsx";
import InputMessage from "./modules/InputMessage.jsx";
import InfoFrame from "./modules/InfoFrame.jsx";
import style from "./styles/chat.module.css";

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