import prisma from '../../../prisma'
import { Request, Response } from 'express'
import { deleteS3 } from '../../../helpers/s3'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../../helpers/sendRes'


const delete = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const { pollId } = req.params

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })

    const poll = await prisma.poll.findUnique({
        where: {
            id: pollId,
            createdById: userId,
        }
    })

    if (!user || !poll) {
        sendError(res, StatusCodes.NotFound, 'Poll not found.'
        return
    }

    const files = poll.files

    try {
        if (files.length > 0) {
            for (const file of files) {
                await deleteS3(file.path)
            }
        }

        await prisma.option.deleteMany({
            where: { pollId }
        })

        await prisma.vote.deleteMany({
            where: { pollId }
        })
    } catch {
        sendError(res, StatusCodes.BadRequest, 'Something went wrong.'
        return
    }

    await prisma.poll.delete({
        where: {
            id: pollId,
            createdById: userId,
        }
    })

    sendSuccess(res, StatusCodes.OK)
})

export { delete }