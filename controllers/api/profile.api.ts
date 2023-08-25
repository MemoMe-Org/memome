import prisma from '../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../utils/StatusCodes'
import { sendError, sendSuccess } from '../../utils/sendRes'
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
            Profile: true,
            Account: true,
            username: true,
            email_verified: true,
        },
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Something went wrong.')
        return
    }

    sendSuccess(res, StatusCodes.OK, { user })
})

export default profile