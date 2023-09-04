import { Router } from 'express'
import userProfile from '../../controllers/api/user.api'

const router: Router = Router()

router.get('/:username', userProfile)

export default router