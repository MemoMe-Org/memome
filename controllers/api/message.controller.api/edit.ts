import prisma from '../../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../../utils/sendRes'

const editMsgVisibility = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { msgId } = req.params
    const { visibility } = req.query

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Something went wrong.')
        return
    }

    switch (visibility) {
        case 'public':
            await prisma.message.update({
                where: {
                    userId,
                    id: msgId
                },
                data: {
                    private: false
                }
            })
            break
        case 'private':
            await prisma.message.update({
                where: {
                    userId,
                    id: msgId
                },
                data: {
                    private: true
                }
            })
            break
    }

    sendSuccess(res, StatusCodes.OK, {
        msg: 'Message visibility changed.'
    })
})

export default editMsgVisibility