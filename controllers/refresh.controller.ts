import prisma from '../prisma'
import { sign, verify } from 'jsonwebtoken'
import { Request, Response } from 'express'
import StatusCodes from '../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../utils/sendRes'

const refreshToken = expressAsyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refresh_token
    if (!refreshToken) {
        sendError(res, StatusCodes.Unauthorized, 'Access Denied.')
        return
    }

    try {
        const isProd = process.env.NODE_ENV === 'production'

        const decoded: any = verify(
            refreshToken,
            process.env.JWT_SECRET!
        )

        const id = decoded.id

        const access_token = sign(
            { id },
            process.env.JWT_SECRET!,
            { expiresIn: '20m' }
        )

        await prisma.users.update({
            where: { id },
            data: { access_token }
        })

        res.cookie('access_token', access_token, {
            domain: isProd ? '' : undefined,
            secure: isProd,
            sameSite: isProd ? 'none' : 'strict',
            maxAge: 20 * 60 * 1000,
        })

        sendSuccess(res, StatusCodes.OK)
    } catch {
        sendError(res, StatusCodes.Forbidden, 'Access Denied.')
        return
    }
})

export default refreshToken