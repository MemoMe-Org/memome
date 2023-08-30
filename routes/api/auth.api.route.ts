import { Router } from 'express'
import settingsRoutes from './settings.api.route'
import verifyUser from '../../middlewares/verifyUser'
import profile from '../../controllers/api/profile.api'

const router: Router = Router()

router.use(verifyUser)

router.use('/settings', settingsRoutes)

router.get('/profile', profile)

export default router