import jwt from 'jsonwebtoken'
import prisma from '../../../prisma'
import { Request, Response } from 'express'
import sortByDates from '../../../utils/sort'
import StatusCodes from '../../../enums/StatusCodes'
import { enc_decrypt } from '../../../utils/enc_decrypt'
import { sendError, sendSuccess } from '../../../utils/sendRes'
const expressAsyncHandler = require('express-async-handler')

const fetchMsg = expressAsyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params
    let { page = 1, limit = 10 } = req.query

    let token = ''
    let isAuthenticated = false

    page = Number(page)
    limit = Number(limit)
    const offset = (page - 1) * Number(limit)

    const authHeader = req.headers?.authorization
    if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
    }

    let user = await prisma.users.findUnique({
        where: {
            username: userId,
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found.')
        return
    }

    let messages = await prisma.message.findMany({
        where: {
            userId: user.id,
        },
        skip: offset,
        take: limit
    })

    let totalMessagesCount = await prisma.message.count({
        where: {
            userId: user.id
        }
    })

    jwt.verify(
        token,
        process.env.JWT_SECRET!,
        (err: any, decoded: any) => {
            if (decoded?.user === user?.username) {
                isAuthenticated = true
            }
        }
    )

    if (isAuthenticated === false) {
        messages = await prisma.message.findMany({
            where: {
                userId: user.id,
                private: false
            },
            skip: offset,
            take: limit
        })

        totalMessagesCount = await prisma.message.count({
            where: {
                userId: user.id,
                private: false,
            }
        })
    }

    const decrytedMsgs = await Promise.all(messages.map(async (message) => {
        if (message.texts) {
            return {
                ...message,
                texts: await enc_decrypt(message.texts, 'd')
            }
        }
        return message
    }))

    sendSuccess(res, StatusCodes.OK, {
        messages: sortByDates(decrytedMsgs),
        length: totalMessagesCount
    })
})

export default fetchMsg