import { useState, useCallback } from "react"

let ws

function init() {
    console.log("Func init WebSocket")

    ws = new WebSocket("wss://ws.qexsystems.ru")

    ws.onopen = () => console.log("Connection opened")

    // ws.onmessage = (wsRes) => {
    //     console.log("______WebSocket message:", JSON.parse(wsRes.data))
    // }

    ws.onclose = () => {
        console.log("Connection closed")
        ws = null
    }
}

init()

function useMessage() {
    const [currentName, setCurrentName] = useState("")
    const [messages, setMessages] = useState([])

    const initOnMessage = useCallback(() => {
        ws.onmessage = (wsRes) => {
            const resMessage = JSON.parse(wsRes.data)

            console.log("WebSocket message:", resMessage)

            navigator.serviceWorker.controller.postMessage(resMessage)
            setMessages([...messages, resMessage])
        }
    }, [messages])

    if (ws) {
        initOnMessage()
    }

    function sendMessage(msg, nameOfSender) {
        if (currentName === "") return

        const newMessage = {
            from: nameOfSender.toLowerCase(),
            messageText: msg,
            time: new Date().toLocaleTimeString().substr(0, 5),
        }

        setMessages([...messages, newMessage])

        navigator.serviceWorker.controller.postMessage(newMessage)

        ws.send(JSON.stringify(newMessage))
    }

    return [sendMessage, setMessages, messages, currentName, setCurrentName]
}

export { useMessage }

// ;(function () {
//     let ws

//     function init() {
//         if (ws) {
//             ws.onerror = ws.onopen = ws.onclose = null
//             ws.close()
//         }

//         ws = new WebSocket("wss://ws.qexsystems.ru")

//         ws.onopen = () => console.log("Connection opened")

//         ws.onmessage = (wsRes) => console.log("ws message:", wsRes.data)

//         ws.onclose = () => {
//             console.log("Connection closed")
//             ws = null
//         }
//     }

//     function sendMsg(msg) {
//         ws.send(msg)
//     }

//     window.WSsendMsg = sendMsg

//     init()
// })()
