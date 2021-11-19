import React from "react"
import { ChatContainer } from "./api/components/Chat"

// navigator.serviceWorker.onmessage = (event) => {
//     console.log("😎CLIENT: Message from SW -", event.data)
// }

const App = () => {
    return (
        <main className='main'>
            <ChatContainer />
        </main>
    )
}

export { App }
