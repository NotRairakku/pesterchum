import styles from "../../../../assets/styles/input_message.module.css"

export default function InputMessage() {
    return (
        <div className={styles.input__container}>
            <form className={styles.input__container_form}>
                <input className={styles.input__container_input} type={'text'}/>
                <button className={styles.input__container_btn} type='submit'>PESTER!</button>
            </form>
        </div>
    )
}