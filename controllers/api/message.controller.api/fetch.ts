import jwt from 'jsonwebtoken'
import prisma from '../../../prisma'
import { Request, Response } from 'express'
import sortByDates from '../../../utils/sort'
import StatusCodes from '../../../enums/StatusCodes'
import { sendError, sendSuccess } from '../../../utils/sendRes'
const expressAsyncHandler = require('express-async-handler')

const fetchMsg = expressAsyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params
    let isMain = false
    let token = ''

    const authHeader = req.headers?.authorization
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    }

    let user = await prisma.users.findUnique({
        where: {
            id: userId,
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found.')
        return
    }

    let messages = await prisma.message.findMany({
        where: {
            userId: user.id,
        }
    })

    jwt.verify(
        token,
        process.env.JWT_SECRET!,
        (err: any, decoded: any) => {
            if (decoded?.user === user?.username) {
                isMain = true
            }
        }
    )

    if (isMain === false) {
        messages = await prisma.message.findMany({
            where: {
                userId: user.id,
                private: false
            }
        })
    }

    sendSuccess(res, StatusCodes.OK, { messages: sortByDates(messages) })
})

export default fetchMsg