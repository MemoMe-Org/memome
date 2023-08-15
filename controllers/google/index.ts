import prisma from '../../prisma'
import { Request } from 'express'
import { Profile } from 'passport'
import genToken from '../../utils/genToken'
import { USER_REGEX } from '../../utils/RegExp'
import newLogin from '../../services/new-login.mail'
import genRandomString from '../../utils/genRandomString'
import { encrypt, decrypt } from '../../utils/enc_decrypt'

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

        const userAgent = req.headers['user-agent']
        const ipAddress: string | undefined = req.socket.remoteAddress?.split(":")[3]

        if (!user) {
            const email: string = profile.emails![0].value
            let username: string = email.split('@')[0]

            const usernameTaken = await prisma.users.findUnique({
                where: { username }
            })

            if (usernameTaken || !USER_REGEX.test(username)) {
                username = genRandomString()
            }

            user = await prisma.users.create({
                data: {
                    email: email,
                    username: username,
                    email_verified: true,
                    auth_method: "google",
                    provider_id: profile.id,
                    avatar: { url: profile.photos![0].value, path: '' },
                }
            })
        }

        const token = genToken(user.email, user.username)
        const isProd = process.env.NODE_ENV === 'production'

        if (await decrypt(user.ipAddress!) !== ipAddress) {
            process.env.NODE_ENV === "production" &&
                await newLogin(user.email, user.username, userAgent!, ipAddress!)
        }

        await prisma.users.update({
            where: {
                username: user.username
            },
            data: {
                login_token: token,
                ipAddress: await encrypt(ipAddress!),
            }
        })

        req?.res?.cookie('auth', token, {
            maxAge: 60 * 24 * 60 * 60 * 1000,
            sameSite: isProd ? 'none' : 'strict',
            httpOnly: true,
            secure: isProd,
        })

        return done(null, user)
    } catch (err) {
        return done(err, null)
    }
}

export default googleAuth