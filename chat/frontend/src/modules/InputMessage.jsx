import React, { useState } from "react";
import { SendChatMessage } from "../../wailsjs/go/main/App";
import styles from "../styles/input_message.module.css";

export default function InputMessage() {
    const [text, setText] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        try {
            await SendChatMessage(text);
            setText("");
        } catch (err) {
            console.error("send failed", err);
        }
    };

    return (
        <div className={styles.input__container}>
            <form className={styles.input__container_form} onSubmit={handleSubmit}>
                <input
                    className={styles.input__container_input}
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write something..."
                />
                <button className={styles.input__container_btn} type="submit">
                    PESTER!
                </button>
                <button className={styles.input__container_btn} type="button">+</button>
            </form>
        </div>
    );
}