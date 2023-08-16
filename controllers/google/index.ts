import prisma from '../../prisma'
import { Request } from 'express'
import { Profile } from 'passport'
import genToken from '../../utils/genToken'
import { USER_REGEX } from '../../utils/RegExp'
import welcome from '../../services/welcome.mail'
import newLogin from '../../services/new-login.mail'
import { enc_decrypt } from '../../utils/enc_decrypt'
import genRandomString from '../../utils/genRandomString'

const googleAuth = async (
    req: Request, refreshToken: string,
    accessToken: string, profile: Profile, done: any
) => {
    try {
        let user = await prisma.users.findUnique({
            where: {
                provider_id: profile.id
            }
        })

        const email: string = profile.emails![0].value
        let username: string = email.split('@')[0]

        let token: string = ""

        const isProd = process.env.NODE_ENV === 'production'

        const userAgent = req.headers['user-agent']
        const ipAddress: string | undefined = req.socket.remoteAddress?.split(":")[3]

        if (!user) {
            const usernameTaken = await prisma.users.findUnique({
                where: { username }
            })

            if (usernameTaken || !USER_REGEX.test(username)) {
                username = genRandomString()
            }

            token = genToken(email, username)

            user = await prisma.users.create({
                data: {
                    email: email,
                    username: username,
                    login_token: token,
                    email_verified: true,
                    auth_method: "google",
                    provider_id: profile.id,
                    last_login: new Date().toISOString(),
                    ipAddress: await enc_decrypt(ipAddress!, 'e'),
                    avatar: { url: profile.photos![0].value, path: '' },
                }
            })

            isProd && await welcome(username, email)
        }

        token = genToken(user.username, user.email)

        await prisma.users.update({
            where: {
                username: user.username
            },
            data: {
                login_token: token,
                last_login: new Date().toISOString(),
                ipAddress: await enc_decrypt(ipAddress!, 'e'),
            }
        })

        req?.res?.cookie('auth', token, {
            maxAge: 60 * 24 * 60 * 60 * 1000,
            sameSite: isProd ? 'none' : 'strict',
            httpOnly: true,
            secure: isProd,
        })

        if (await enc_decrypt(user.ipAddress!, 'd') !== ipAddress) {
            isProd && await newLogin(user.email, user.username, userAgent!, ipAddress!)
        }

        return done(null, user)
    } catch (err) {
        return done(err, null)
    }
}

export default googleAuth