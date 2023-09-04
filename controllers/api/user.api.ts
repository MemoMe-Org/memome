import prisma from '../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../utils/sendRes'

const userProfile = expressAsyncHandler(async (req: Request, res: Response) => {
    const { username } = req.params

    const user = await prisma.users.findUnique({
        where: { username },
        select: {
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

    sendSuccess(res, StatusCodes.OK)
})

export default userProfile