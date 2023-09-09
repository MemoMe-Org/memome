import prisma from '../prisma'
import { Request, Response } from 'express'
import StatusCodes from '../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'

const clear = (req: Request, res: Response) => {
    const cookieNames = Object.keys(req.cookies)
    cookieNames.forEach((cookie: string) => {
        res.clearCookie(cookie)
    })

    res.sendStatus(StatusCodes.NoContent)
}

const logout = expressAsyncHandler(async (req: Request, res: Response) => {
    const cookies = req.cookies
    if (!cookies?.refresh_token) {
        return clear(req, res)
    }

    const refresh_token = cookies.refresh_token
    const user = await prisma.users.findFirst({
        where: { refresh_token }
    })

    if (!user) return clear(req, res)

    await prisma.users.update({
        where: {
            username: user.username
        },
        data: {
            access_token: null,
            refresh_token: null,
            last_logout: new Date().toISOString()
        }
    })

    clear(req, res)
})

export { logout }