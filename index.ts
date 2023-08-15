import dotenv from 'dotenv'
dotenv.config()

// import middlewares
import express, {
    Request, Application,
    Response, NextFunction,
} from 'express'
import logger from 'morgan'
import passport from 'passport'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import cors, { CorsOptions } from 'cors'

// import routes
import authRoute from './routes/auth.route'

// initialize
const app: Application = express()
const allowedOrigins: string[] = [
    process.env.CLIENT_URL!,
]
const PORT: unknown = process.env.PORT || 2002
const isProd: boolean = process.env.NODE_ENV === 'production'

// set middlewares
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({
    extended: true, limit: '10mb'
}))
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin: unknown = req.headers.origin
    if (allowedOrigins.includes(origin as string)) {
        res.header('Access-Control-Allow-Credentials')
        res.header("Access-Control-Allow-Origin", origin as string)
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    }
    next()
})
app.use(cookieParser())
app.use(logger('dev'))
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin!) !== -1 || !origin) {
            callback(null, true)
        } else {
            throw new Error("Not allowed by CORS!")
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

// intialize routes
app.use('/auth', authRoute)

app.listen(PORT, () => console.log(`http://localhost:${PORT}`))