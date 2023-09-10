import prisma from '../prisma'
import { sign, verify } from 'jsonwebtoken'
import { Request, Response } from 'express'
import StatusCodes from '../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../utils/sendRes'

const refreshToken = expressAsyncHandler(async (req: Request, res: Response) => {
    const refresh_token = req.cookies?.refresh_token
    if (!refreshToken) {
        sendError(res, StatusCodes.Unauthorized, 'Access Denied.')
        return
    }

    verify(
        refresh_token,
        process.env.JWT_SECRET!,
        async (err: any, decoded: any) => {
            try {
                const isProd = process.env.NODE_ENV === 'production'

                if (err) {
                    sendError(res, StatusCodes.Forbidden, 'Access Denied.')
                    return
                }

                const id = decoded.id
                const expiry = decoded.exp

                const user = await prisma.users.findFirst({
                    where: { refresh_token }
                })

                if (!user) {
                    sendError(res, StatusCodes.Forbidden, 'Invalid refresh token.')
                    return
                }

                if ((Date.now() / 1000) > expiry) {
                    sendError(res, StatusCodes.Unauthorized, 'Refresh token expired.')
                    return
                }

                const access_token = sign(
                    { id },
                    process.env.JWT_SECRET!,
                    { expiresIn: '20m' }
                )

                res.cookie('access_token', access_token, {
                    domain: isProd ? '' : undefined,
                    secure: isProd,
                    sameSite: isProd ? 'none' : 'strict',
                    maxAge: 20 * 60 * 1000,
                })

                sendSuccess(res, StatusCodes.OK, { access_token })
            } catch {
                sendError(res, StatusCodes.Forbidden, 'Something went wrong.')
                return
            }
        }
    )
})

export default refreshToken