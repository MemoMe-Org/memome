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
                        increment: 0.2
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
            Profile: true,
            Account: true,
            username: true,
            Settings: true,
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found.')
        return
    }

    if (user.Account?.disabled) {
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

    const output = {
        bio: user.Profile?.bio,
        username: user.username,
        avatar: user.Profile?.avatar,
        verified: user.Account?.verified,
        msg_type: user.Settings?.gen_msg_type,
        allowTexts: user.Settings?.allow_texts,
        allowFiles: user.Settings?.allow_files,
    }

    sendSuccess(res, StatusCodes.OK, { user: output })
})

export default checkUser