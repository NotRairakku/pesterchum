import React, { useEffect, useRef, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { EventsOn } from "../../wailsjs/runtime";

import styles from "../styles/messages.module.css";

export const ChatMessages = () => {
    const [messages, setMessages] = useState([]);
    const virtuosoRef = useRef(null);

    useEffect(() => {
        const unsubHistory = EventsOn("history", (payload) => {
            const newMsgs = payload.messages || [];
            setMessages((prev) => {
                const combined = [...prev, ...newMsgs];
                combined.sort((a, b) => (a.created || "").localeCompare(b.created || ""));
                return combined;
            });
        });

        const unsubNew = EventsOn("new_message", (payload) => {
            const msg = payload.message;
            if (msg) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        const unsubError = EventsOn("error", (payload) => {
            alert("Ошибка чата: " + (payload.message || "???"));
        });

        return () => {
            unsubHistory();
            unsubNew();
            unsubError();
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0 && virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
                index: messages.length - 1,
                align: "end",
                behavior: "smooth",
            });
        }
    }, [messages.length]);

    return (
        <div className={styles.messages}>
            <Virtuoso
                ref={virtuosoRef}
                style={{ height: "100%" }}
                data={messages}
                initialTopMostItemIndex={messages.length - 1}
                itemContent={(_, msg) => {
                    if (msg.isSystem && msg.systemType === "SESSION_START") {
                        const { from, to } = msg.payload || {};
                        return (
                            <div className={styles.messages__system}>
                                -- {from?.full || "?"} <span style={{ color: from?.color || "#fff" }}>
                                    [{from?.short || "?"}]
                                </span> begin pester{" "}
                                {to?.full || "?"} <span style={{ color: to?.color || "#fff" }}>
                                    [{to?.short || "?"}]
                                </span> --
                            </div>
                        );
                    }

                    const color = msg.sender?.color || "#ffffff";
                    const name = msg.sender?.short || "??";

                    return (
                        <div
                            className={`${styles.messages__container} ${msg.isMine ? styles.mine : ""}`}
                        >
                            <span className={styles.messages__container_name} style={{ color }}>
                                {name}:{" "}
                            </span>
                            <span className={styles.messages__container_text} style={{ color }}>
                                {msg.text || ""}
                            </span>
                        </div>
                    );
                }}
            />
        </div>
    );
};