import dotenv from 'dotenv'
dotenv.config()

// import middlewares
import logger from 'morgan'
import passport from 'passport'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'
import express, { Application } from 'express'

// initialize
const app: Application = express()
const allowedOrigns: string[] = []
const PORT: unknown = process.env.PORT || 2002
const isProd: boolean = process.env.NODE_ENV === 'production'

// set middlewares
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({
    extended: true, limit: '10mb'
}))
app.use(cookieParser())
app.use(logger('dev'))
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigns.indexOf(origin!) !== -1 || !origin) {
            callback(null, true)
        } else {
            throw new Error("Cors not allowed!")
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET,PUT,DELETE,POST"
} as CorsOptions))
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
    cookie: {
        httpOnly: true,
        secure: isProd,
        maxAge: 60 * 24 * 60 * 60 * 1000,
        sameSite: isProd ? 'none' : 'strict',
    }
}))
app.use(passport.initialize())
app.use(passport.session())

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))