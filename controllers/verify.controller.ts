import prisma from '../prisma'
import { OTPAction } from '../type'
import { Request, Response } from 'express'
import { EMAIL_REGEX } from '../utils/RegExp'
import StatusCodes from '../utils/StatusCodes'
import { sendError, sendSuccess } from '../utils/sendRes'
const expressAsyncHandler = require('express-async-handler')

const resetOTP = async (email: string, action: OTPAction) => {
    await prisma.users.update({
        where: { email },
        data: {
            totp: null,
            totp_expiry: null,
            login_token: action === 'denied' ? undefined : '',
            email_verified: action === 'granted' ? true : undefined
        }
    })
}

const verify = expressAsyncHandler(async (req: Request, res: Response) => {
    let { email, otp } = req.body
    email = email?.toLowerCase()?.trim()

    if (!email || !EMAIL_REGEX.test(email) || !otp) {
        sendError(res, StatusCodes.BadRequest, 'Invalid credentials provided.')
        return
    }

    const user = await prisma.users.findUnique({
        where: { email }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'Account does not exist.')
        return
    }

    const now = Date.now()
    const totp_expiry = user.totp_expiry || 0

    if (now > totp_expiry) {
        await resetOTP(email, 'denied')
        sendError(res, StatusCodes.BadRequest, 'The OTP you provided has expired.')
        return
    }

    if (otp !== user.totp) {
        sendError(res, StatusCodes.Unauthorized, 'Incorrect OTP.')
        return
    }

    await resetOTP(email, 'granted')
    sendSuccess(res, StatusCodes.OK, {
        success: true,
        msg: 'Verification was successful.'
    })
})

export { verify }