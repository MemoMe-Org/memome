import sharp from 'sharp'
import bcrypt from 'bcrypt'
import prisma from '../prisma'
import handleFile from '../utils/file'
import { Request, Response } from 'express'
import { uploadS3, getS3 } from '../utils/s3'
import StatusCodes from '../utils/StatusCodes'
import welcome from '../services/welcome.services'
import genRandomString from '../utils/genRandomString'
import { USER_REGEX, EMAIL_REGEX } from '../utils/RegExp'
import { sendError, sendSuccess } from '../utils/sendRes'
const expressAsyncHandler = require('express-async-handler')

const signup = expressAsyncHandler(async (req: Request, res: Response) => {
    let { email, password, password2 } = req.body
    email = email?.trim()?.toLowerCase()

    if (!email || !password || !password2) {
        sendError(res, StatusCodes.BadRequest, 'All fields are required.')
        return
    }

    if (password !== password2) {
        sendError(res, StatusCodes.BadRequest, 'Passwords not match.')
        return
    }

    if (!EMAIL_REGEX.test(email)) {
        sendError(res, StatusCodes.BadRequest, 'Invalid email.')
        return
    }

    const userExists = await prisma.users.findUnique({
        where: { email }
    })

    if (userExists) {
        sendError(res, StatusCodes.Conflict, 'Account already exists.')
        return
    }

    let username: string = email.split('@')[0]

    const usernameTaken = await prisma.users.findUnique({
        where: { username }
    })

    if (!USER_REGEX.test(username) || usernameTaken) {
        username = genRandomString()
    }

    password = await bcrypt.hash(password, 10)

    const newUser = await prisma.users.create({
        data: {
            email,
            password,
            username,
            auth_method: 'local'
        }
    })

    if (req.file) {
        const file = handleFile(res, req.file)
        try {
            const buffer: Buffer = await sharp(file.buffer)
                .resize({ width: 600, height: 600, fit: 'cover' })
                .toBuffer()
            const path: string = `Avatars/${newUser.id}${file.extension}`
            const url = await getS3(path)
            await uploadS3(buffer, path, file.mimetype)
            await prisma.users.update({
                where: { id: newUser.id },
                data: {
                    avatar: { url, path }
                }
            })
        } catch {
            sendError(res, StatusCodes.BadRequest, 'Failed to upload profile picture.')
            // but continue with account creation
        }
    }

    process.env.NODE_ENV === "production" &&
        await welcome(newUser.username, newUser.email)

    sendSuccess(res, StatusCodes.Created, {
        success: true,
        msg: 'Account creation was successful.'
    })
})

export { signup }