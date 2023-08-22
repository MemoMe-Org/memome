import { Router } from 'express'
import verifyUser from '../../middlewares/verifyUser'
import profile from '../../controllers/api/profile.api'

const router: Router = Router()

router.get('/profile', verifyUser, profile)

export default router