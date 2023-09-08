import prisma from '../../prisma'
import { Request, Response } from 'express'
import { USER_REGEX } from '../../utils/RegExp'
import StatusCodes from '../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../../utils/sendRes'


const account = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        },
        select: {
            Profile: true,
            Account: true,
            username: true,
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Something went wrong.')
        return
    }

    sendSuccess(res, StatusCodes.OK, { user })
})

const editUsername = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.userId
    const username = req.body?.username?.toLowerCase()?.trim()

    if (!username || !USER_REGEX.test(username)) {
        sendError(res, StatusCodes.BadRequest, 'Username not allowed.')
        return
    }

    try {
        await prisma.users.update({
            where: {
                id: user
            },
            data: { username }
        })
    } catch {
        sendError(res, StatusCodes.BadRequest, 'Something went wrong.')
        return
    }

    sendSuccess(res, StatusCodes.OK, { msg: 'Successful.' })
})

const editDisability = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    const toggle = Boolean(req.body?.toogle)

    try {
        await prisma.accounts.update({
            where: { userId },
            data: {
                disabled: toggle
            }
        })
    } catch {
        sendError(res, StatusCodes.BadRequest, 'Something went wrong.')
        return
    }

    sendSuccess(res, StatusCodes.OK, { msg: 'Successful.' })
})

export default account
export { editUsername, editDisability }