import React from "react"

const checkFullNameValid = (fullName) =>
    fullName.split(" ").length === 2 && fullName.trim().length > 6

const Popup = (props) => {
    const {
        onChangeName,
        currentName,
        setAddressee,
        addresseeName,
        closePopup,
        contacts,
        setContacts,
        isPopupShow,
        isOffline,
    } = props

    const [newContactText, setNewContactText] = React.useState("")

    const onChangeNewContact = (e) => setNewContactText(e.target.value)

    const isNewContactText = checkFullNameValid(newContactText)

    const isNameValid = checkFullNameValid(currentName)

    const addNewContact = () => {
        if (isNewContactText && !isOffline) {
            setContacts([...new Set([...contacts, newContactText])])
            setAddressee(newContactText)
        }
    }

    const onSubmit = (e) => {
        e.preventDefault()
        if (isNameValid) {
            localStorage.setItem("name", currentName)
            localStorage.setItem("addresseeName", addresseeName)
            closePopup()
        }
    }

    const validInputStyle = (isValid) => ({
        boxShadow: isValid
            ? "0px 0px 0px 3px var(--green-light)"
            : "0px 0px 0px 0px var(--green-light)",
    })

    const onSelectChange = (e) => setAddressee(e.target.value)

    return (
        <div className={`popup ${isPopupShow && "popup-show"}`}>
            <form className='popup__form' onSubmit={onSubmit}>
                <h1>PWA Chat {isOffline && "(offline)"}</h1>
                <input
                    className='popup__your-name'
                    type='text'
                    value={currentName}
                    placeholder='Your first and last name'
                    onChange={onChangeName}
                    style={validInputStyle(isNameValid)}
                    disabled={isOffline}
                />

                <label className='popup__contacts'>
                    {contacts.length !== 0 ? (
                        <>
                            Open a dialogue with
                            <select
                                className='popup__contacts-select'
                                value={addresseeName}
                                onChange={onSelectChange}
                            >
                                {contacts.map((contact) => (
                                    <option
                                        className='popup__contacts-option'
                                        value={contact}
                                        key={contact}
                                    >
                                        {contact}
                                    </option>
                                ))}
                            </select>
                        </>
                    ) : (
                        "You don't have contacts"
                    )}
                </label>

                <div className='popup__new-contact'>
                    <input
                        className='popup__addressee-name'
                        type='text'
                        placeholder='Add new contact'
                        value={newContactText}
                        onChange={onChangeNewContact}
                        style={validInputStyle(isNewContactText)}
                        disabled={isOffline}
                    />

                    <button
                        className='popup__new-contact-icon'
                        onClick={addNewContact}
                        type='button'
                        disabled={isOffline}
                    >
                        +
                    </button>
                </div>

                <button
                    className='popup__btn'
                    type='submit'
                    style={
                        isNameValid && addresseeName
                            ? {
                                  backgroundColor: "var(--green-light)",
                              }
                            : {}
                    }
                >
                    Save
                </button>
            </form>
        </div>
    )
}

export { Popup }
