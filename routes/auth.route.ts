import { Router } from 'express'
import limit from '../middlewares/limiter.middleware'
import { login } from '../controllers/login.controller'
import { signup } from '../controllers/signup.controller'
import { logout } from '../controllers/logout.controller'
import { passport } from '../controllers/google/callback.google'

const router: Router = Router()

const { CLIENT_URL } = process.env

router.post('/login', limit({
    max: 5,
    timerArr: [90, 60, 45, 75],
    msg: 'Too many attempts. Try again later.'
}), login)
router.post('/signup', signup)
router.get('/logout', logout)

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['email', 'profile']
    })
)
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        successRedirect: `${CLIENT_URL!}/profile`,
        failureRedirect: `${CLIENT_URL!}/auth/login/failed`
    })
)

export default router