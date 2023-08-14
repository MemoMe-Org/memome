interface IGenOTP {
    totp: string,
    totp_expiry: number
}

interface ILimiter {
    max: number
    timerArr: number[]
    msg?: string
}

interface IMail {
    to: string
    body: string
    subject: string
}