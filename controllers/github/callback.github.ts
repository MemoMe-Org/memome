import axios from 'axios'
import { Octokit } from 'octokit'
import prisma from '../../prisma'
import { Request, Response } from 'express'
import genToken from '../../utils/genToken'
import { sendError } from '../../utils/sendRes'
import { USER_REGEX } from '../../utils/RegExp'
import welcome from '../../services/welcome.mail'
import StatusCodes from '../../utils/StatusCodes'
import newLogin from '../../services/new-login.mail'
import { enc_decrypt } from '../../utils/enc_decrypt'
import genRandomString from '../../utils/genRandomString'
const expressAsyncHanlder = require('express-async-handler')

const githubAuthCallback = expressAsyncHanlder(async (req: Request, res: Response) => {
    const { code } = req.query
    const { CLIENT_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = process.env

    const { data } = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
            code,
            client_id: GITHUB_CLIENT_ID!,
            client_secret: GITHUB_CLIENT_SECRET,
        }
    )

    const accessToken = new URLSearchParams(data).get('access_token')
    if (!accessToken) {
        sendError(res, StatusCodes.NotFound, 'Failed to obtain access token.')
        return
    }

    const octokit = new Octokit({
        auth: accessToken,
    })

    const userResponse = await octokit.request("GET /user")
    const emailsResonse = await octokit.request("GET /user/emails")

    const userData = userResponse.data
    const email = emailsResonse.data[0].email

    let token: string = ""
    let username = userData.login?.toLowerCase() || ''

    const isProd = process.env.NODE_ENV === 'production'

    const userAgent = req.headers['user-agent']
    const ipAddress = req.socket.remoteAddress?.split(":")[3]

    let user = await prisma.users.findUnique({
        where: { email }
    })

    if (!user) {
        const usernameTaken = await prisma.users.findUnique({
            where: { username }
        })

        if (usernameTaken || !USER_REGEX.test(username)) {
            username = genRandomString()
        }

        user = await prisma.users.create({
            data: {
                email, username,
                email_verified: true,
                auth_method: 'github',
                provider_id: String(userData.id),
            }
        })

        await prisma.profiles.create({
            data: {
                avatar: { url: userData.avatar_url, path: '' },
                userId: user.id
            }
        })

        token = genToken(user.id, email, username)

        await prisma.users.update({
            where: { email },
            data: {
                login_token: token,
                last_login: new Date().toISOString(),
                ip_address: await enc_decrypt(ipAddress!, 'e')
            }
        })

        isProd && await welcome(username, email)
    }

    token = genToken(user.id, user.username, user.email)

    await prisma.users.update({
        where: {
            username: user.username
        },
        data: {
            login_token: token,
            last_login: new Date().toISOString(),
            ip_address: await enc_decrypt(ipAddress!, 'e'),
        }
    })

    res.cookie('auth', token, {
        domain: isProd ? '' : undefined,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 60 * 24 * 60 * 60 * 1000,
    })

    if (await enc_decrypt(user.ip_address!, 'd') !== ipAddress) {
        isProd && await newLogin(user.email, user.username, userAgent!, ipAddress!)
    }

    res.redirect(`${CLIENT_URL}/profile`)
})

export { githubAuthCallback }