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
        const email: string = profile.emails![0].value

        let user = await prisma.users.findUnique({
            where: { email }
        })

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

            user = await prisma.users.create({
                data: {
                    email, username,
                    email_verified: true,
                    auth_method: "google",
                    provider_id: profile.id,
                }
            })

            await prisma.profiles.create({
                data: {
                    avatar: { url: profile.photos![0].value, path: '' },
                    userId: user.id
                }
            })

            token = genToken(user.id, email, username)

            await prisma.users.update({
                where: { email },
                data: {
                    login_token: token,
                    last_login: new Date().toISOString(),
                    ipAddress: await enc_decrypt(ipAddress!, 'e')
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
                ipAddress: await enc_decrypt(ipAddress!, 'e'),
            }
        })

        req?.res?.cookie('auth', token, {
            domain: isProd ? '' : undefined,
            secure: isProd,
            sameSite: isProd ? 'none' : 'strict',
            maxAge: 60 * 24 * 60 * 60 * 1000,
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