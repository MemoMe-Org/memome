import prisma from '../prisma'
import { Request, Response } from 'express'
const exoressAsyncHandler = require('express-async-handler')

const logout = exoressAsyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.cookie

    if (!authHeader) {
        res.destroy()
        res.clearCookie('auth')
        return res.sendStatus(204)
    }

    const cookie = authHeader.split(' ')[1]
    const user = await prisma.users.findFirst({
        where: {
            login_token: cookie
        }
    })

    if (!user) {
        res.destroy()
        res.clearCookie('auth')
        return res.sendStatus(204)
    }

    await prisma.users.update({
        where: {
            username: user.username
        },
        data: {
            login_token: ""
        }
    })

    res.destroy()
    res.clearCookie('auth')
    res.sendStatus(204)
})

export { logout }