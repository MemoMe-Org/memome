import jwt from 'jsonwebtoken'
import prisma from '../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../utils/sendRes'

const userProfile = expressAsyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params

    let token = ''
    let authUser: any
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

    if (user.Account?.disabled) {
        sendError(res, StatusCodes.Unauthorized)
        return
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET!,
        async (err: any, decoded: any) => {
            if (err) {
                isAuthenticated = false
            } else {
                if (decoded?.user !== username) {
                    await prisma.profiles.update({
                        where: {
                            userId: user.id
                        },
                        data: {
                            views: {
                                increment: 1
                            },
                            msg_point: {
                                increment: 0.1
                            },
                            poll_point: {
                                increment: 0.1
                            }
                        }
                    })
                }
                try {
                    authUser = await prisma.users.findUnique({
                        where: {
                            username: decoded?.user
                        },
                        select: {
                            Profile: true,
                            username: true,
                        }
                    })
                    isAuthenticated = true
                } catch {
                    isAuthenticated = false
                }
            }
        }
    )

    sendSuccess(res, StatusCodes.OK, {
        user: { ...user, authUser, isAuthenticated }
    })
})

export default userProfile