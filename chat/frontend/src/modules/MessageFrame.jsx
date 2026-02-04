import style from "../../../../assets/styles/message_frame.module.css";
import { ChatMessages } from "./ChatMessages.jsx";
import { useMemo } from "react";

export const mockMessages = [
    {
        id: "sys-1",
        isSystem: true,
        systemType: "SESSION_START",
        payload: {
            from: {
                short: "EB",
                full: "ectoBiologist",
                color: "#0715cd"
            },
            to: {
                short: "TT",
                full: "tentacleTherapist",
                color: "#bd50dd"
            },
            timestamp: Date.now()
        }
    },
    {
        id: "1",
        isSystem: false,
        sender: {
            short: "EB",
            full: "ectoBiologist",
            color: "#0715cd"
        },
        text: "hello!"
    },
    {
        id: "2",
        isSystem: false,
        sender: {
            short: "TT",
            full: "tentacleTherapist",
            color: "#bd50dd"
        },
        text: "you and dave is gay... wow"
    }
];

export default function MessageFrame() {
    return (
        <div className={style.frame}>
            <p className={style.frame__title}>PESTERLOG:</p>
            <div className={style.frame__message}>
                <ChatMessages messages={mockMessages} />
            </div>
        </div>
    );
}
