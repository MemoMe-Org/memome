import { Request, Response } from 'express'
import prisma from '../../prisma'
import { sendError, sendSuccess } from '../../utils/sendRes'
import StatusCodes from '../../utils/StatusCodes'
const expressAsyncHandler = require('express-async-handler')

const profile = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        },
        select: {
            id: true,
            email: true,
            username: true,
            provider_id: true,
            email_verified: true,
        },
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found')
        return
    }

    let profile = await prisma.profiles.findUnique({
        where: { userId },
    })

    sendSuccess(res, StatusCodes.OK, {
        success: true,
        data: {
            user,
            profile
        }
    })
})

export default profile