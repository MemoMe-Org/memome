import crypto from 'crypto'

const genFileName = () => {
    return crypto.randomBytes(16).toString('hex')
}

export default genFileName