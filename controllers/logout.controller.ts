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
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        return clear(req, res)
    }

    const token = authHeader.split(' ')[1]
    const user = await prisma.users.findFirst({
        where: {
            login_token: token
        }
    })

    if (!user) return clear(req, res)

    await prisma.users.update({
        where: {
            username: user.username
        },
        data: {
            login_token: null,
            last_logout: new Date().toISOString()
        }
    })

    clear(req, res)
})

export { logout }