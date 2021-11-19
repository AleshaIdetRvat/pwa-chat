import React, { useEffect, useState } from "react"
import { useMessage } from "./hooks/message.hook"

// navigator.serviceWorker.onmessage = (event) => {
//     console.log("😎CLIENT: Message from SW -", event.data)
// }

const App = () => {
    const [sendMessage, setMessages, messages, currentName, setCurrentName] =
        useMessage()

    const [messageText, setMessageText] = useState("")

    console.log("messages:", messages)

    useEffect(() => {
        navigator.serviceWorker.onmessage = (event) => {
            setMessages(event.data)
        }

        navigator.serviceWorker.controller.postMessage("GET_MESSAGES")

        return () => {
            navigator.serviceWorker.onmessage = null
        }
    }, [])

    return (
        <main className='main'>
            <input
                type='text'
                value={currentName}
                placeholder='your name'
                onChange={(e) => setCurrentName(e.target.value)}
            />
            <hr />

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(messageText, currentName)
                }}
            >
                <input
                    type='text'
                    placeholder='message'
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                />
            </form>

            <ul>
                {messages.map(({ from, messageText, time }) => {
                    return (
                        <li>
                            <b>{from || "_anonym"}: </b>
                            {typeof messageText === "string" && messageText}
                            <i>{time}</i>
                        </li>
                    )
                })}
            </ul>
        </main>
    )
}

export { App }
