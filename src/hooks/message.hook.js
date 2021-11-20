import { useState, useCallback } from "react"

let ws

function initWebSocketConnection() {
    ws = new WebSocket("wss://ws.qexsystems.ru")

    ws.onopen = () => console.log("Connection opened")

    ws.onclose = () => {
        console.log("Connection closed")
        ws = null
    }
}

initWebSocketConnection()

function useMessage() {
    const [isOffline, setIsOffline] = useState(false)

    const [contacts, setContacts] = useState([])

    const [currentName, setCurrentName] = useState(
        localStorage.getItem("name") || ""
    )

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

            if (resMessage.to === currentName.toLowerCase()) {
                navigator.serviceWorker.controller.postMessage({
                    myName: currentName,
                    message: resMessage,
                })

                setMessages([...messages, resMessage])
            }
        }
    }, [messages, currentName])

    if (ws) {
        isOffline && setIsOffline(false)
        initOnMessage()
    } else {
        !isOffline && setIsOffline(true)
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
        contacts,
        setContacts,
        isOffline,
        setIsOffline,
    ]
}

export { useMessage }
