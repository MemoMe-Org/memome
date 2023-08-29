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


const toggles = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { type } = req.params
    const { toggle } = req.body

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Something went wrong.')
        return
    }

    switch (type) {
        case 'files':
            await prisma.settings.update({
                where: { userId },
                data: {
                    allow_files: toggle
                }
            })
            break
        case 'texts':
            await prisma.settings.update({
                where: { userId },
                data: {
                    allow_texts: toggle
                }
            })
            break
        case 'levels':
            await prisma.settings.update({
                where: { userId },
                data: {
                    show_levels: toggle
                }
            })
            break
    }

    sendSuccess(res, StatusCodes.OK)
})


const messageType = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { type } = req.query

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Something is wrong.')
        return
    }

    if (
        type !== 'normal' && type !== 'all' &&
        type !== 'nasty' && type !== 'relationship'
    ) {
        sendError(res, StatusCodes.BadRequest, 'Something is wrong.')
        return
    }

    await prisma.settings.update({
        where: { userId },
        data: {
            gen_msg_type: type
        }
    })

    sendSuccess(res, StatusCodes.OK)
})

export default settings
export { toggles, messageType }