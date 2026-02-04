import { useRef, useState, useEffect } from "react";
import styles from "../../../../assets/styles/list.module.css";

export default function CustomScroll({ children, height = 128 }) {
    const contentRef = useRef(null);
    const [thumbTop, setThumbTop] = useState(0);

    const syncThumb = () => {
        const el = contentRef.current;
        const trackHeight = height - 40; // 2 buttons of 20
        const thumbHeight = 24;

        const maxScroll = el.scrollHeight - el.clientHeight;
        const maxThumbTop = trackHeight - thumbHeight;

        const ratio = el.scrollTop / maxScroll || 0;
        setThumbTop(ratio * maxThumbTop);
    };


    const scrollBy = (delta) => {
        contentRef.current.scrollTop += delta;
    };

    const dragging = useRef(false);
    const startY = useRef(0);
    const startScroll = useRef(0);

    const onThumbDown = (e) => {
        dragging.current = true;
        startY.current = e.clientY;
        startScroll.current = contentRef.current.scrollTop;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!dragging.current) return;
        const el = contentRef.current;
        const delta =
            (e.clientY - startY.current) *
            (el.scrollHeight / el.clientHeight);
        el.scrollTop = startScroll.current + delta;
    };

    const onMouseUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };


    useEffect(() => {
        syncThumb();
    }, []);

    return (
        <div style={{ display: "flex" }}>
            <div style={{
                height,
                border: "4px solid var(--color-border-primary)",
                background: "var(--color-block-bg)",
                overflow: "hidden",
                flex: 1
            }}>
                <div ref={contentRef} className={styles.viewport} onScroll={syncThumb}>
                    {children}
                </div>
            </div>

            <div className={styles.scrollbar}>
                <button className={styles.track__btn} onClick={() => scrollBy(-20)}>▲</button>
                <div className={styles.track}>
                    <div className={styles.thumb} onMouseDown={onThumbDown} style={{ top: thumbTop }}/>
                </div>
                <button className={styles.track__btn} onClick={() => scrollBy(20)}>▼</button>
            </div>
        </div>
    );
}
