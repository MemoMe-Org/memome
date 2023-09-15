import prisma from '../../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../../utils/sendRes'


const vote = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { pollId, optionId } = req.params

    const poll = await prisma.poll.findUnique({
        where: {
            id: pollId,
        }
    })

    const option = await prisma.option.findUnique({
        where: {
            pollId,
            id: optionId
        }
    })

    if (!poll || !option) {
        sendError(res, StatusCodes.NotFound, 'Poll or option not found.')
        return
    }

    const voted = await prisma.pollVote.findUnique({
        where: {
            userId,
            pollId,
            optionId
        }
    })

    if (voted) {
        sendError(res, StatusCodes.BadRequest, 'Already voted.')
        return
    }

    await prisma.pollVote.create({
        data: {
            user: {
                connect: {
                    id: userId
                }
            },
            poll: {
                connect: {
                    id: pollId
                }
            },
            option: {
                connect: {
                    id: optionId
                }
            }
        }
    })

    await prisma.poll.update({
        where: {
            id: pollId,
        },
        data: {
            totalVotes: {
                increment: 1
            }
        }
    })

    await prisma.option.update({
        where: {
            pollId,
            id: optionId
        },
        data: {
            totalVotes: {
                increment: 1
            }
        }
    })

    sendSuccess(res, StatusCodes.OK, 'Successfully voted.')
})

export { vote }