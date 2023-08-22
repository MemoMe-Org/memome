import { Request, Response } from 'express'
import prisma from '../../prisma'
import { sendError, sendSuccess } from '../../utils/sendRes'
import StatusCodes from '../../utils/StatusCodes'
const expressAsyncHandler = require('express-async-handler')

const anonUser = expressAsyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params

    const user = await prisma.users.findUnique({
        where: { username },
        select: {
            id: true,
            email: true,
            username: true,
            Account: true,
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

    await prisma.users.update({
        where: { username },
        data: {
            Profile: {
                update: {
                    views: {
                        increment: 1
                    },
                    msgPoint: {
                        increment: 0.5
                    }
                }
            }
        }
    })

    sendSuccess(res, StatusCodes.OK, { user })
})

export default anonUser