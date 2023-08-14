import { Router } from 'express'
import upload from '../middlewares/upload.middleware'
import limit from '../middlewares/limiter.middleware'
import { login } from '../controllers/login.controller'
import { signup } from '../controllers/signup.controller'
import { logout } from '../controllers/logout.controller'

const router: Router = Router()

router.post('/login', limit({
    max: 5,
    timerArr: [90, 60, 45, 75],
    msg: 'Too many attempts. Try again later.'
}), login)
router.post('/signup', upload.single('avatar'), signup)
router.get('/logout', logout)

export default router