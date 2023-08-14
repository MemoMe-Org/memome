import bcrypt from 'bcrypt'
import prisma from '../prisma'
import genToken from '../utils/genToken'
import { Request, Response } from 'express'
import { EMAIL_REGEX } from '../utils/RegExp'
import StatusCodes from '../utils/StatusCodes'
import newLogin from '../services/new-login.services'
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
        sendError(res, StatusCodes.NotFound, 'Sign in with other Providers.')
        return
    }

    const match: boolean = await bcrypt.compare(password, user.password!)
    if (!match) {
        sendError(res, StatusCodes.Unauthorized, 'Incorrect password.')
        return
    }

    const token: string = genToken(user.username, user.email)
    const isProd: boolean = process.env.NODE_ENV === "production"

    const userAgent = req.headers['user-agent']
    const ipAddress: string | undefined = req.socket.remoteAddress?.split(":")[3]

    await prisma.users.update({
        where: { id: user.id },
        data: {
            ipAddress,
            login_token: token,
            last_login: `${new Date().toISOString()}`
        }
    })

    if (user.ipAddress !== ipAddress) {
        process.env.NODE_ENV === "production" &&
            await newLogin(user.email, user.username, userAgent!, ipAddress!)
    }

    res.cookie('auth', token, {
        maxAge: 60 * 24 * 60 * 60 * 1000,
        sameSite: isProd ? 'none' : 'strict',
        httpOnly: true,
        secure: isProd,
    })
    sendSuccess(res, StatusCodes.OK, {
        success: true
    })
})

export { login }