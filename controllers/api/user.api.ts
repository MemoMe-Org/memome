import jwt from 'jsonwebtoken'
import prisma from '../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../utils/sendRes'

const userProfile = expressAsyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params

    let token = ''
    let isAuthenticated = false

    const authHeader = req.headers?.authorization
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    }

    const user = await prisma.users.findUnique({
        where: { username },
        select: {
            id: true,
            Profile: true,
            Account: true,
            Settings: true,
            username: true,
            email_verified: true,
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound)
        return
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET!,
        (err: any, decoded: any) => {
            if (decoded?.username === user.username) {
                isAuthenticated = true
            }
        }
    )

    if (user.Account?.disabled) {
        sendError(res, StatusCodes.Unauthorized)
        return
    }

    await prisma.profiles.update({
        where: {
            userId: user.id
        },
        data: {
            views: {
                increment: 1
            }
        }
    })

    sendSuccess(res, StatusCodes.OK, {
        user: { ...user, isAuthenticated }
    })
})

export default userProfile