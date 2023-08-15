import prisma from '../prisma'
import getCookie from '../utils/getCookie'
import { Request, Response } from 'express'
import StatusCodes from '../utils/StatusCodes'
const exoressAsyncHandler = require('express-async-handler')

const clear = (res: Response) => {
    res.clearCookie('auth')
    res.sendStatus(StatusCodes.NoContent)
}

const logout = exoressAsyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.cookie

    if (!authHeader) return clear(res)

    const cookie = getCookie(authHeader, 'auth')
    const user = await prisma.users.findFirst({
        where: {
            login_token: cookie
        }
    })

    if (!user) return clear(res)

    await prisma.users.update({
        where: {
            username: user.username
        },
        data: {
            login_token: "",
            last_logout: new Date().toISOString()
        }
    })

    clear(res)
})

export { logout }