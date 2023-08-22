import jwt from 'jsonwebtoken'
import prisma from '../prisma'
import { sendError } from '../utils/sendRes'
import StatusCodes from '../utils/StatusCodes'
import { Request, Response, NextFunction } from 'express'
const expressAsyncHandler = require('express-async-handler')

const verifyUser = expressAsyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        sendError(res, StatusCodes.Unauthorized, 'Access Denied')
        return
    }

    const token = authHeader.split(' ')[1]

    jwt.verify(
        token,
        process.env.JWT_SECRET!,
        async (err: any, decoded: any) => {

            if (err) {
                sendError(res, StatusCodes.Forbidden, 'Access Denied.')
                return
            }

            const user = await prisma.users.findFirst({
                where: {
                    login_token: token
                }
            })

            if (!user) {
                sendError(res, StatusCodes.Forbidden, 'Access Denied.')
                return
            }

            // @ts-ignore
            req.email = decoded.email
            // @ts-ignore
            req.username = decoded.username
            // @ts-ignore
            req.userId = decoded.id

            next()
        }
    )
})

export default verifyUser