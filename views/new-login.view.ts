import sendEmail from '../utils/sendEmai'

const newLogin = async (username: string, email: string) => {
    await sendEmail({
        to: email,
        subject: 'Login Notification',
        body: `.. coming back`
    })
}

export default newLogin