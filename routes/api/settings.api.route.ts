import { Router } from 'express'
import settings, {
    messageType, toggles
} from '../../controllers/api/settings.api'

const router: Router = Router()

router.get('/', settings)
router.put('/toggle/:type', toggles)
router.get('/msg-type', messageType) // takes query

export default router