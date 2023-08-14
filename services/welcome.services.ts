import sendEmail from '../utils/sendEmai'

const welcome = async (username: string, email: string) => {
    await sendEmail({
        to: email,
        subject: 'Welcome to MemoMe',
        body: `.. coming back`
    })
}

export default welcome