import path from 'path'
import { readFileSync } from 'fs'
import Handlebars from 'handlebars'
import { sendNodeEmail } from '../helpers/sendEmail'

const welcome = async (username: string, email: string) => {
    const emailData: object = { username }
    const templateSource = readFileSync(
        path.join(__dirname, '../', './templates', '/welcome.hbs'), 'utf8'
    )
    const template = Handlebars.compile(templateSource)
    const emailBody = template(emailData)

    await sendNodeEmail({
        to: email,
        subject: 'Welcome to MemoMe',
        body: emailBody
    })
}

export default welcome