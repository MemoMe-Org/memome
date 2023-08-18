import prisma from '../prisma'
import getCookie from '../utils/getCookie'
import { Request, Response } from 'express'
import StatusCodes from '../utils/StatusCodes'
const expressAsyncHandler = require('express-async-handler')

const clear = (req: Request, res: Response) => {
    const cookieNames = Object.keys(req.cookies)
    cookieNames.forEach((cookie: string) => {
        res.clearCookie(cookie)
    })

    res.sendStatus(StatusCodes.NoContent)
}

const logout = expressAsyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.cookie
    if (!authHeader) return clear(req, res)

    const cookie = getCookie(authHeader, 'auth')
    const user = await prisma.users.findFirst({
        where: {
            login_token: cookie
        }
    })

    if (!user) return clear(req, res)

    await prisma.users.update({
        where: {
            username: user.username
        },
        data: {
            login_token: "",
            last_logout: new Date().toISOString()
        }
    })

    clear(req, res)
})

export { logout }