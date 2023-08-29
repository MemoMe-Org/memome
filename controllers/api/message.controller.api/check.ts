import prisma from '../../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../../enums/StatusCodes'
import { sendError, sendSuccess } from '../../../utils/sendRes'
const expressAsyncHandler = require('express-async-handler')

const increment = async (username: string) => {
    await prisma.users.update({
        where: { username },
        data: {
            Profile: {
                update: {
                    views: {
                        increment: 1
                    },
                    msg_point: {
                        increment: 1
                    }
                }
            }
        }
    })
}

const checkUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query
    const { username } = req.params

    const user = await prisma.users.findUnique({
        where: { username },
        select: {
            id: true,
            email: true,
            username: true,
            Settings: true,
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found.')
        return
    }

    const account = await prisma.accounts.findUnique({
        where: {
            userId: user.id
        }
    })

    if (account?.disabled) {
        sendError(res, StatusCodes.Unauthorized, 'Account has been disbled by user.')
        return
    }

    if (token) {
        const isUser = await prisma.users.findFirst({
            where: {
                login_token: token as any
            }
        })

        if (isUser?.username !== username) {
            await increment(username)
        }
    } else {
        await increment(username)
    }

    sendSuccess(res, StatusCodes.OK, { user })
})

export default checkUser