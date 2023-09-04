import { Router } from 'express'
import profile, {
    changeAvatar, deleteAvatar
} from '../../controllers/api/profile.api'
import settingsRoutes from './settings.api.route'
import verifyUser from '../../middlewares/verifyUser'
import upload from '../../middlewares/upload.middleware'

const router: Router = Router()

router.use(verifyUser)

router.use('/settings', settingsRoutes)

router.get('/profile', profile)

router.route(
    '/avatar'
).post(
    upload.single('avatar'),
    changeAvatar
).delete(deleteAvatar)

export default router