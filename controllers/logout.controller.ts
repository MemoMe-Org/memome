import prisma from '../prisma'
import { Request, Response } from 'express'
const exoressAsyncHandler = require('express-async-handler')

const clear = (req: Request, res: Response) => {
    req.destroy()
    res.clearCookie('auth')
    res.sendStatus(204)
}

const logout = exoressAsyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.cookie

    if (!authHeader) {
        clear(req, res)
        return
    }

    const cookie = authHeader.split('; ').find((row: any) => row.startsWith('auth='))?.split('=')[1]
    const user = await prisma.users.findFirst({
        where: {
            login_token: cookie
        }
    })

    if (!user) {
        clear(req, res)
        return
    }

    await prisma.users.update({
        where: {
            username: user.username
        },
        data: {
            login_token: ""
        }
    })

    clear(req, res)
})

export { logout }