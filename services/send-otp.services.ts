import sendEmail from '../utils/sendEmai'

const sendOTP = async (otp: string, email: string) => {
    await sendEmail({
        to: email,
        subject: 'One-time password.',
        body: `.. coming back`
    })
}

export default sendOTP