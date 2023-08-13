import bcrypt from 'bcrypt'
import prisma from '../prisma'
import genToken from '../utils/genToken'
import { Request, Response } from 'express'
import { EMAIL_REGEX } from '../utils/RegEx'
import StatusCodes from '../utils/StatusCodes'
import { sendError, sendSuccess } from '../utils/sendRes'
const expressAsyncHandler = require('express-async-handler')

const login = expressAsyncHandler(async (req: Request, res: Response) => {
    let { userId, password } = req.body
    userId = userId?.trim()?.toLowerCase()

    if (!userId || !password) {
        sendError(res, StatusCodes.BadRequest, 'All fields are required.')
        return
    }

    const user = EMAIL_REGEX.test(userId) ? await prisma.users.findUnique({
        where: { email: userId }
    }) : await prisma.users.findUnique({
        where: { username: userId }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Invalid User ID or Password.')
        return
    }

    if (user.auth_method !== "local") {
        sendError(res, StatusCodes.NotFound, 'Sign in with Google or Github.')
        return
    }

    const match: boolean = await bcrypt.compare(password, user.password!)
    if (!match) {
        sendError(res, StatusCodes.Unauthorized, 'Incorrect password.')
        return
    }

    const token: string = genToken(user.username, user.email)

    // set cookie
    sendSuccess(res, StatusCodes.OK, {

    })
})

export { login }