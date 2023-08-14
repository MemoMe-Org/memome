import sendEmail from '../utils/sendEmail'

const newLogin = async (
    email: string, username: string,
    userAgent: string, ipAddress: string
) => {
    await sendEmail({
        to: email,
        subject: 'Login Notification',
        body: `.. coming back`
    })
}

export default newLogin