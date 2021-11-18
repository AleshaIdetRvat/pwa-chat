import React, { useEffect, useState } from "react"
import { useMessage } from "./hooks/message.hook"

// navigator.serviceWorker.onmessage = (event) => {
//     console.log("😎CLIENT: Message from SW -", event.data)
// }

const App = () => {
    const [sendMessage, setMessages, messages, currentName, setCurrentName] =
        useMessage()

    const [to, setTo] = useState("")
    const [messageText, setMessageText] = useState("")

    window.sendMessage = sendMessage

    // console.log("messages:", messages)

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
            <input
                type='text'
                value={to}
                placeholder='To'
                onChange={(e) => setTo(e.target.value)}
            />
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage(messageText, currentName, to)
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
                {messages.map(({ from, message }) => {
                    return (
                        <li>
                            <b>{from}: </b>
                            {message}
                        </li>
                    )
                })}
            </ul>
        </main>
    )
}

export { App }
