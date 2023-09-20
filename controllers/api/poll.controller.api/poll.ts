import prisma from '../../../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../../utils/sendRes'


const poll = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { pollId, createdById } = req.params

    let isAuthenticated = true
    const ids: string[] = [createdById, userId]

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

    const voter = await prisma.users.findUnique({
        where: {
            id: userId
        },
        select: {
            username: true,
            Profile: {
                select: {
                    avatar: true
                }
            }
        }
    })

    if (!voter) {
        isAuthenticated = false
    }

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found.')
        return
    }

    if (user.Account?.disabled) {
        sendError(res, StatusCodes.NotFound, 'Account has been disabled by User.')
        return
    }

    if (!isAuthenticated) {
        await prisma.poll.update({
            where: {
                id: pollId
            },
            data: {
                views: {
                    increment: 1
                },
            }
        })

        for (const idx of ids) {
            await prisma.profiles.update({
                where: {
                    userId: idx
                },
                data: {
                    poll_point: {
                        increment: 0.05
                    }
                }
            })
        }
    }

    const pollInfo = await prisma.poll.findUnique({
        where: {
            id: pollId,
        },
        include: {
            votes: {
                where: { userId },
                select: {
                    userId: true,
                    optionId: true
                },
            },
        },
    })

    const outputPoll = await prisma.poll.findUnique({
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
        },
    })

    if (!pollInfo || !outputPoll) {
        sendError(res, StatusCodes.NotFound, 'Poll not found.')
        return
    }

    const hasVoted = pollInfo.votes.some((vote) => vote.userId === userId)
    const votedOption = hasVoted ? pollInfo.votes[0].optionId : null

    sendSuccess(res, StatusCodes.OK, {
        user,
        voter: { ...voter, isAuthenticated },
        poll: { ...outputPoll, hasVoted, votedOption },
    })
})

export { poll }