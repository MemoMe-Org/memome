const cipher = require('text-encryption')

const { TEXT_KEY } = process.env

const encrypt = async (text: string) => {
    if (!text) return

    return cipher.encrypt(text, TEXT_KEY)
}

const decrypt = async (text: string) => {
    if (!text) return

    return cipher.decrypt(text, TEXT_KEY)
}

export { decrypt, encrypt }