import prisma from '../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../enums/StatusCodes'
import { sendError, sendSuccess } from '../../utils/sendRes'
const expressAsyncHandler = require('express-async-handler')

const settings = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId

    const user = await prisma.settings.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Something went wrong.')
        return
    }

    sendSuccess(res, StatusCodes.OK, { user })
})

export default settings