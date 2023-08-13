import sharp from 'sharp'
import bcrypt from 'bcrypt'
import prisma from '../prisma'
import handleFile from '../utils/file'
import { uploadS3 } from '../utils/s3'
import { Request, Response } from 'express'
import StatusCodes from '../utils/StatusCodes'
import genRandomString from '../utils/genRandomString'
import { USER_REGEX, EMAIL_REGEX } from '../utils/RegEx'
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
        username = genRandomString().toLowerCase().trim()
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
        const buffer: Buffer = await sharp(file.buffer)
            .resize({ width: 600, height: 600, fit: 'cover' })
            .toBuffer()
        const path: string = `Avatars/${newUser.id}${file.extension}`
        try {
            await uploadS3(buffer, path, file.mimetype)
        } catch {
            sendError(res, StatusCodes.BadRequest, 'Failed to upload profile picture')
            // continue with account creation
        }
    }

    sendSuccess(res, StatusCodes.Created, {
        success: true,
        msg: 'Account creation was successful.'
    })
})

export { signup }