import { useState, useCallback } from "react"

let ws

function init() {
    ws = new WebSocket("wss://ws.qexsystems.ru")

    ws.onopen = () => console.log("Connection opened")

    ws.onclose = () => {
        console.log("Connection closed")
        ws = null
    }
}

init()

function useMessage() {
    const [currentName, setCurrentName] = useState(
        localStorage.getItem("name") || ""
    )
    console.log("currentName", currentName)

    const [addresseeName, setAddresseeName] = useState(
        localStorage.getItem("addresseeName") || ""
    )

    const [messages, setMessages] = useState([])

    const initOnMessage = useCallback(() => {
        function isMessageObjValid(msg) {
            const isNextStep =
                msg && typeof msg === "object" && !Array.isArray(msg)
            if (isNextStep) {
                const msgProperties = Object.getOwnPropertyNames(msg)
                return (
                    msgProperties.join() ===
                    ["from", "to", "messageText", "time"].join()
                )
            }
            return false
        }

        ws.onmessage = (wsRes) => {
            const resMessage = JSON.parse(wsRes.data)

            if (!isMessageObjValid(resMessage)) return

            console.log(`resMessage`, resMessage)

            console.log(`resMessage.to`, resMessage.to)
            console.log(`currentName`, currentName)

            if (resMessage.to === currentName.toLowerCase()) {
                console.log("WebSocket message:", resMessage)

                navigator.serviceWorker.controller.postMessage({
                    myName: currentName,
                    message: resMessage,
                })

                setMessages([...messages, resMessage])
            }
        }
    }, [messages, currentName])

    if (ws) {
        initOnMessage()
    }

    function sendMessage(msg) {
        if (currentName === "") return

        const newMessage = {
            from: currentName.toLowerCase(),
            to: addresseeName.toLowerCase(),
            messageText: msg,
            time: new Date().toLocaleTimeString().substr(0, 5),
        }

        setMessages([...messages, newMessage])

        navigator.serviceWorker.controller.postMessage({
            myName: currentName,
            message: newMessage,
        })

        ws.send(JSON.stringify(newMessage))
    }

    return [
        sendMessage,
        setMessages,
        messages,
        currentName,
        setCurrentName,
        addresseeName,
        setAddresseeName,
    ]
}

export { useMessage }
