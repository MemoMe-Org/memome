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

    const user
})