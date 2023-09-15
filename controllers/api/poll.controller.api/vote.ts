import prisma from '../../../prisma'
import { Request, Response } from 'express'
import handleFile from '../../../utils/file'
import MaxSize from '../../../enums/fileMaxSizes'
import genFileName from '../../../utils/genFileName'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { deleteS3, getS3, uploadS3 } from '../../../utils/s3'
import { sendError, sendSuccess } from '../../../utils/sendRes'


const vote = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { optionId } = req.query
    const { pollId, username } = req.params

    const voted = await prisma.pollVote.findUnique({
        where: {
            userId,
            pollId,
            optionId: optionId as string,
        }
    })

    if (voted) {
        sendError(res, StatusCodes.BadRequest, 'Already voted.')
        return
    }

    const newVote = await prisma.pollVote.create({
        where: {
            userId_optionId_pollId: {

            }
        }
    })

    const poll = await prisma.poll.update({
        where: {
            id: pollId,
            createdById: userId,
        },
        data: {
            totalVotes: {
                increment: 1
            }
        }
    })

    const option = await prisma.option.update({
        where: {
            pollId,
            id: optionId as string,
        },
        data: {
            totalVotes: {
                increment: 1
            }
        }
    })
})

export { vote }