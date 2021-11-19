import React from "react"

const checkFullNameValid = (fullName) =>
    fullName.split(" ").length === 2 && fullName.trim().length > 6

const Popup = (props) => {
    const {
        onChangeName,
        currentName,
        onChangeAddressee,
        addresseeName,
        closePopup,
    } = props

    const isNameValid = checkFullNameValid(currentName)

    const isAddresseeNameValid = checkFullNameValid(addresseeName)

    const onSubmit = (e) => {
        e.preventDefault()

        if (isNameValid && isAddresseeNameValid) {
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

    return (
        <div className='popup'>
            <form className='popup__form' onSubmit={onSubmit}>
                <h1>PWA Chat</h1>
                <input
                    className='popup__your-name'
                    type='text'
                    value={currentName}
                    placeholder='Your first and last name'
                    onChange={onChangeName}
                    style={validInputStyle(isNameValid)}
                />

                <input
                    className='popup__addressee-name'
                    type='text'
                    placeholder='Addressee first and last name'
                    value={addresseeName}
                    onChange={onChangeAddressee}
                    style={validInputStyle(isAddresseeNameValid)}
                />

                <button
                    className='popup__btn'
                    type='submit'
                    style={
                        isNameValid && isAddresseeNameValid
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
