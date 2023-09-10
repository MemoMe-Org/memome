import jwt from 'jsonwebtoken'
import { sendError } from '../utils/sendRes'
import StatusCodes from '../enums/StatusCodes'
import { Request, Response, NextFunction } from 'express'
const expressAsyncHandler = require('express-async-handler')

const verifyUser = expressAsyncHandler(async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers?.authorization
    if (!authHeader || !authHeader?.startsWith('Bearer')) {
        sendError(res, StatusCodes.Unauthorized, 'Access Denied.')
        return
    }

    const access_token = authHeader.split(' ')[1]

    jwt.verify(
        access_token,
        process.env.JWT_SECRET!,
        async (err: any, decoded: any) => {
            try {
                if (err) {
                    sendError(res, StatusCodes.Forbidden, 'Access Denied.')
                    return
                }

                if (Date.now() > decoded.exp) {
                    sendError(res, StatusCodes.Unauthorized, 'Access token expired.')
                    return
                }

                // @ts-ignore
                req.userId = decoded.id

                next()
            } catch {
                sendError(res, StatusCodes.Forbidden, 'Something went wrong.')
                return
            }
        }
    )
})

export default verifyUser