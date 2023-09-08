import bcrypt from 'bcrypt'
import prisma from '../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../utils/sendRes'

const editPswd = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const username = req.username
    const { oldPswd, pswd, pswd2 } = req.body

    if (!oldPswd || !pswd || !pswd2) {
        sendError(res, StatusCodes.BadRequest, 'All fields are required.')
        return
    }

    if (pswd !== pswd2) {
        sendError(res, StatusCodes.BadRequest, 'Passwords not match.')
        return
    }

    const user = await prisma.users.findUnique({
        where: { username }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Account not found.')
        return
    }

    const authMethod = user.auth_method
    if (!user.password) {
        sendError(
            res,
            StatusCodes.BadRequest,
            `Password cannot be edited. You signed in with ${authMethod}.`
        )
        return
    }

    const isMatch: boolean = await bcrypt.compare(oldPswd, user.password)
    if (!isMatch) {
        sendError(res, StatusCodes.Unauthorized, 'Current password is incorrect.')
        return
    }

    await prisma.users.update({
        where: { username },
        data: {
            password: await bcrypt.hash(pswd, 10)
        }
    })

    sendSuccess(res, StatusCodes.OK, { msg: 'Password successfully updated.' })
})

export { editPswd }