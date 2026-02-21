import { ChatMessages } from "./ChatMessages.jsx";
import style from "../styles/message_frame.module.css";

export default function MessageFrame() {
    return (
        <div className={style.frame}>
            <p className={style.frame__title}>PESTERLOG:</p>
            <div className={style.frame__message}>
                <ChatMessages/>
            </div>
        </div>
    );
}