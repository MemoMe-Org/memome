import { sendPlunkEmail } from '../utils/sendEmail'

const sendOTP = async (otp: string, email: string) => {
    await sendPlunkEmail({
        to: email,
        subject: 'One-time password.',
        body: `.. coming back`
    })
}

export default sendOTP