import jwt from 'jsonwebtoken'
import prisma from '../prisma'
import { sendError } from '../utils/sendRes'
import StatusCodes from '../enums/StatusCodes'
import { Request, Response, NextFunction } from 'express'
const expressAsyncHandler = require('express-async-handler')

const verifyUser = expressAsyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const cookies = req.cookies
    if (!cookies?.access_token) {
        sendError(res, StatusCodes.Unauthorized, 'Access Denied.')
        return
    }

    const access_token = cookies.access_token

    jwt.verify(
        access_token,
        process.env.JWT_SECRET!,
        async (err: any, decoded: any) => {
            try {
                if (err) {
                    sendError(res, StatusCodes.Forbidden, 'Access Denied.')
                    return
                }

                const user = await prisma.users.findFirst({
                    where: { access_token }
                })

                if (!user) {
                    sendError(res, StatusCodes.Forbidden, 'Access Denied.')
                    return
                }

                // @ts-ignore
                req.userId = decoded.id

                next()
            } catch {
                sendError(res, StatusCodes.BadRequest, 'Something went wrong.')
                return
            }
        }
    )
})

export default verifyUser