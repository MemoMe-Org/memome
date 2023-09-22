import prisma from '../../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../../helpers/sendRes'


const edit = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { pollId, type } = req.params

    const poll = await prisma.poll.findUnique({
        where: {
            userId,
            id: pollId
        },
    })

    if (!poll) {
        sendError(res, StatusCodes.NotFound, 'Poll not found.')
        return
    }

    let updatedPoll

    switch (type) {
        case 'active':
            updatedPoll = await prisma.poll.update({
                where: { userId, pollId },
                data: {
                    active: !poll.active
                }
            })
            break
        case 'visiblity':
            updatedPoll = await prisma.poll.update({
                where: { userId, pollId },
                data: {
                    private: !poll.private
                }
            })
            break
        default:
            break
    }

    sendSuccess(res, StatusCodes.OK)
})