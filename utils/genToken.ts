import jwt, { Secret } from 'jsonwebtoken'

const genToken = (id: string, user: string, email: string): string => {
    const token: Secret = jwt.sign(
        { id, user, email },
        process.env.JWT_SECRET!,
        { expiresIn: '60d' }
    )
    return token
}

export default genToken