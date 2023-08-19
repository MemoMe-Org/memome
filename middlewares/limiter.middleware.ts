import { ILimiter } from '../interfaces'
import { sendError } from '../utils/sendRes'
import { Request, Response, NextFunction } from 'express'
import rateLimit,
{ RateLimitRequestHandler, Options } from 'express-rate-limit'

export default function limit({
    max,
    timerArr,
    msg = "Too many requests sent."
}: ILimiter): RateLimitRequestHandler {
    const limiter: RateLimitRequestHandler = rateLimit({
        max, // max attempt
        windowMs: timerArr[Math.floor(Math.random() * timerArr.length)] * 1000, // throttle
        message: msg,
        handler: (req: Request, res: Response, next: NextFunction, options: Options) => {
            sendError(res, options.statusCode, options.message)
        },
        legacyHeaders: false,
        standardHeaders: true,
    })

    return limiter
}