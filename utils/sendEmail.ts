import { IMail } from '../type'
import plunk from '../configs/plunk.config'

const sendEmail = async ({ to, subject, body }: IMail) => {
    try {
        await plunk.emails.send({ to, subject, body })
    } catch (err: unknown) {
        console.log(err)
    }
}

export default sendEmail