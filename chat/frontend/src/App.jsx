import TopBar from "./modules/TopBar.jsx";
import style from "../../../assets/styles/chat.module.css";
import MessageFrame from "./modules/MessageFrame.jsx";
import InputMessage from "./modules/InputMessage.jsx";


export default function App() {
    return (
        <div className={style.chat}>
            <TopBar DisplayUserName={'ectoBiologist'}/>
            <div className={style.chat__container}>
                <MessageFrame/>
                <InputMessage/>
            </div>
        </div>
    );
}
