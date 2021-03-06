import React, { useEffect, useState } from "react"
import { useMessage } from "../../hooks/message.hook"
import { Popup } from "./Popup"

const ChatMessage = ({ from, messageText, time, isMyMessage }) => {
    return (
        <li
            className={`messages-list__item message ${
                isMyMessage && "my-message"
            }`}
        >
            <div className='message__container'>
                <div className='message__ava addressee-ava'>
                    <span className='addressee-ava__inner'>
                        {from[0].toUpperCase()}
                    </span>
                </div>

                <div className='message__content'>
                    <h3 className='message__full-name'>{from}</h3>
                    <p className='message__text'>
                        {typeof messageText === "string" && messageText}

                        <time className='message__time'>{time}</time>
                    </p>
                </div>
            </div>
        </li>
    )
}

const Chat = (props) => {
    const {
        onSubmit,
        onChangeMessageText,
        messageText,
        messages,
        addresseeName,
        onHeaderClick,
        currentName,
        isOffline,
    } = props

    const isInputTextValid = messageText.trim() !== ""

    const [inputRowsCount, setInputRowsCount] = useState(1)

    const onSendMessage = (e) => {
        onSubmit(e)
        setInputRowsCount(1)
    }

    const onKeyDown = (e) => {
        // func for text area auto resize
        if (
            e.key === "Backspace" &&
            messageText[messageText.length - 1] === "\n"
        ) {
            setInputRowsCount(inputRowsCount - 1)
        }
        if (e.key === "Enter") {
            setInputRowsCount(inputRowsCount + 1)
        }
    }

    return (
        <div className='chat'>
            <div className='chat__container'>
                <header
                    className='chat__header'
                    aria-label='open setting'
                    role='button'
                    onClick={onHeaderClick}
                >
                    <div className='chat__addressee chat-addressee'>
                        <div className='chat-addressee__ava addressee-ava'>
                            <span className='addressee-ava__inner'>
                                {addresseeName[0]?.toUpperCase()}
                            </span>
                        </div>

                        <h2 className='chat-addresse__name'>{addresseeName}</h2>
                    </div>
                </header>

                <ul className='chat__messages messages-list'>
                    {messages &&
                        messages.map(({ from, messageText, time }, i) => {
                            return (
                                <ChatMessage
                                    key={from + messageText + time + i}
                                    isMyMessage={
                                        from.toLowerCase() ===
                                        currentName.toLowerCase()
                                    }
                                    from={from}
                                    messageText={messageText}
                                    time={time}
                                />
                            )
                        })}
                </ul>

                <form
                    className='chat__bottom send-block'
                    onSubmit={onSendMessage}
                >
                    <textarea
                        className='send-block__input'
                        disabled={isOffline}
                        wrap='off'
                        value={messageText}
                        onChange={onChangeMessageText}
                        onKeyDown={onKeyDown}
                        rows={inputRowsCount}
                        type='text'
                        placeholder='Enter text message...'
                    />

                    <button
                        className='send-block__btn'
                        type='submit'
                        disabled={!isInputTextValid || isOffline}
                    >
                        <svg
                            className='send-block__btn-icon'
                            viewBox='0 0 35 35'
                            fill='none'
                            xmlns='http://www.w3.org/2000/svg'
                        >
                            <path
                                fill={
                                    messageText.trim() === ""
                                        ? "var(--grey-send-btn)"
                                        : "var(--green)"
                                }
                                style={{ transition: "0.2s" }}
                                fillRule='evenodd'
                                clipRule='evenodd'
                                d='M34.9229 1.5002C35.0025 1.30144 35.0219 1.08369 34.9789 0.873962C34.9359 0.664233 34.8323 0.471742 34.6809 0.320352C34.5295 0.168963 34.337 0.0653337 34.1273 0.0223111C33.9175 -0.0207115 33.6998 -0.00123505 33.501 0.0783258L33.2932 0.161451L1.67945 12.8052L1.67727 12.8074L0.688515 13.2011C0.501244 13.2758 0.338265 13.4008 0.217581 13.5624C0.0968965 13.7239 0.0232045 13.9156 0.00464454 14.1164C-0.0139154 14.3171 0.0233791 14.5191 0.112409 14.7C0.201438 14.8809 0.338737 15.0337 0.50914 15.1415L1.40602 15.7102L1.4082 15.7146L11.3898 22.0649L12.3348 22.6665L12.9363 23.6115L19.2866 33.593L19.291 33.5974L19.8598 34.4943C19.9679 34.664 20.1207 34.8006 20.3015 34.8891C20.4823 34.9776 20.6839 35.0144 20.8843 34.9957C21.0847 34.9769 21.276 34.9032 21.4372 34.7827C21.5984 34.6622 21.7232 34.4996 21.7979 34.3127L22.1938 33.3218L34.8398 1.70583L34.9229 1.49801V1.5002ZM30.9132 5.63458L31.9435 3.0577L29.3666 4.08801L12.9735 20.4811L13.7129 20.9515C13.8486 21.0376 13.9636 21.1526 14.0498 21.2883L14.5201 22.0277L30.9132 5.63458V5.63458Z'
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )
}

const ChatContainer = () => {
    const [
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
    ] = useMessage()

    const [isPopupShow, setIsPopupShow] = useState(
        !localStorage.getItem("name")
    )

    const [messageText, setMessageText] = useState("")

    useEffect(async () => {
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data.type === "OFFLINE") return setIsOffline(true)

            if (event.data.type === "GET_MESSAGES" && event.data.messages) {
                setMessages(event.data.messages)
                setContacts([...new Set([...contacts, ...event.data.users])])
            } else {
                setMessages([])
            }
        }

        try {
            navigator.serviceWorker.controller.postMessage({
                type: "GET_MESSAGES",
                myName: currentName ? currentName.toLowerCase() : "",
                message: {
                    from: currentName ? currentName.toLowerCase() : "",
                    to: addresseeName ? addresseeName.toLowerCase() : "",
                },
            })
        } catch (error) {
            alert("Please reload window (Ctrl + R) ????")
        }

        return () => {
            navigator.serviceWorker.onmessage = null
        }
    }, [addresseeName, navigator.serviceWorker.controller])

    const onChangeName = (e) => setCurrentName(e.target.value)

    const onChangeMessageText = (e) => setMessageText(e.target.value)

    const onSubmit = (e) => {
        e.preventDefault()
        sendMessage(messageText.trim())
        setMessageText("")
    }

    const onHeaderClick = () => setIsPopupShow(true)

    return (
        <>
            <Popup
                isOffline={isOffline}
                isPopupShow={isPopupShow}
                setAddressee={setAddresseeName}
                addresseeName={addresseeName}
                onChangeName={onChangeName}
                currentName={currentName}
                closePopup={() => setIsPopupShow(false)}
                contacts={contacts}
                setContacts={setContacts}
            />

            <Chat
                isOffline={isOffline}
                currentName={currentName}
                onHeaderClick={onHeaderClick}
                addresseeName={addresseeName}
                messages={messages}
                onSubmit={onSubmit}
                onChangeMessageText={onChangeMessageText}
                messageText={messageText}
            />
        </>
    )
}

export { ChatContainer }
