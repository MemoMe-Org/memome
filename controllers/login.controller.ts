import bcrypt from 'bcrypt'
import prisma from '../prisma'
import genToken from '../utils/genToken'
import { Request, Response } from 'express'
import { EMAIL_REGEX } from '../utils/RegExp'
import StatusCodes from '../enums/StatusCodes'
import newLogin from '../services/new-login.mail'
import { enc_decrypt } from '../utils/enc_decrypt'
import expressAsyncHandler from 'express-async-handler'
import { sendError, sendSuccess } from '../utils/sendRes'

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

    if (!user.password) {
        sendError(res, StatusCodes.NotFound, 'Sign in with other Providers.')
        return
    }

    const match: boolean = await bcrypt.compare(password, user.password!)
    if (!match) {
        sendError(res, StatusCodes.Unauthorized, 'Incorrect password.')
        return
    }

    const isProd: boolean = process.env.NODE_ENV === "production"
    const token: string = genToken(user.id, user.username, user.email)

    const userAgent = req.headers['user-agent']
    const ipAddress: string | undefined = req.socket.remoteAddress?.split(":")[3]

    await prisma.users.update({
        where: { id: user.id },
        data: {
            login_token: token,
            ip_address: await enc_decrypt(ipAddress!, 'e'),
            last_login: new Date().toISOString()
        }
    })

    if (await enc_decrypt(user.ip_address!, 'd') !== ipAddress) {
        isProd && await newLogin(user.email, user.username, userAgent!, ipAddress!)
    }

    res.cookie('auth', token, {
        domain: isProd ? '' : undefined,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 60 * 24 * 60 * 60 * 1000,
    })
    sendSuccess(res, StatusCodes.OK, {
        msg: 'Login successful.',
    })
})

export { login }