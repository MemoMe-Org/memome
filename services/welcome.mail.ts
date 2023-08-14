import sendEmail from '../utils/sendEmail'

const welcome = async (username: string, email: string) => {
    await sendEmail({
        to: email,
        subject: 'Welcome to MemoMe',
        body: `.. coming back`
    })
}

export default welcome