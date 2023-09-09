import { Response } from 'express'
import jwt, { Secret } from 'jsonwebtoken'
import prisma from '../prisma'

const genTokens = async (
    res: Response,
    id: string,
) => {
    const isProd = process.env.NODE_ENV === 'production'

    const access_token: Secret = jwt.sign(
        { id },
        process.env.JWT_SECRET!,
        { expiresIn: '20m' }
    )

    const refresh_token: Secret = jwt.sign(
        { id },
        process.env.JWT_SECRET!,
        { expiresIn: '90d' }
    )

    await prisma.users.update({
        where: { id },
        data: { refresh_token }
    })

    res.cookie('access_token', access_token, {
        domain: isProd ? '' : undefined,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 20 * 60 * 1000,
    })

    res.cookie('access_token', refresh_token, {
        domain: isProd ? '' : undefined,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 90 * 24 * 60 * 60 * 1000,
    })
}

export default genTokens