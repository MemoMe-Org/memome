import { sendNodeEmail } from '../helpers/sendEmail'

const welcome = async (username: string, email: string) => {
    await sendNodeEmail({
        to: email,
        subject: 'Welcome to MemoMe',
        body: `.. coming back`
    })
}

export default welcome