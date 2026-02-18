import React, { useEffect, useRef } from "react";
import { Virtuoso } from "react-virtuoso";

import styles from "../styles/messages.module.css";

export const ChatMessages = ({messages}) => {
    const virtuosoRef = useRef(null);
    useEffect(() => {
        if (!messages?.length) return;

        virtuosoRef.current.scrollToIndex({
            index: messages.length - 1,
            align: "end",
        });
    }, [messages.length]);

    return (
        <div className={styles.messages}>
            <Virtuoso
                ref={virtuosoRef}
                style={{ height: "100%" }}
                data={messages}
                initialTopMostItemIndex={messages.length - 1} // start scroll position
                itemContent={(index, msg) => {
                    if (msg.isSystem && msg.systemType === "SESSION_START") {
                        const { from, to, timestamp } = msg.payload;

                        return (
                            <div className={styles.messages__system}>
                                <span>-- {from.full}{" "}<span style={{ color: from.color }}>[{from.short}]</span>
                                    {" "}begin pester{" "}{to.full}{" "}
                                    <span style={{ color: to.color }}>[{to.short}]</span> --</span>
                            </div>
                        );
                    }

                    return (
                        <div className={styles.messages__container}>
                            <span className={styles.messages__container_name} style={{ color: msg.sender.color }}>{msg.sender.short}: </span>
                            <span className={styles.messages__container_text} style={{ color: msg.sender.color }}>{msg.text}</span>
                        </div>
                    );
                }}
            />
        </div>
    );
};
