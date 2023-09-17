import prisma from '../../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../../utils/sendRes'


const poll = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { pollId, createdById } = req.params

    const user = await prisma.users.findUnique({
        where: {
            id: createdById
        },
        select: {
            username: true,
            Account: {
                select: {
                    disabled: true,
                    verified: true
                }
            },
            Profile: {
                select: {
                    bio: true,
                    avatar: true
                }
            }
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found.')
        return
    }

    if (user.Account?.disabled) {
        sendError(res, StatusCodes.NotFound, 'Account has been disabled by User.')
        return
    }

    const pollInfo = await prisma.poll.findUnique({
        where: {
            id: pollId,
        },
        include: {
            options: {
                select: {
                    id: true,
                    texts: true,
                    totalVotes: true,
                },
            },
            votes: {
                where: { userId },
                select: {
                    userId: true,
                    optionId: true,
                },
            },
        },
    })

    if (!pollInfo) {
        sendError(res, StatusCodes.NotFound, 'Poll not found.')
        return
    }

    const hasVoted = pollInfo.votes.some((vote) => vote.userId === userId)

    sendSuccess(res, StatusCodes.OK, {
        user,
        poll: {
            ...pollInfo, hasVoted
        },
    })
})

export { poll }