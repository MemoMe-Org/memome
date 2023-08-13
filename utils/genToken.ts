import jwt, { Secret } from 'jsonwebtoken'

const genToken = (user: string, email: string): string => {
    const token: Secret = jwt.sign(
        { user, email },
        process.env.JWT_SECRET!,
        { expiresIn: '60d' }
    )
    return token
}

export default genToken