import { Router } from 'express'
import {
    messageType, toggles
} from '../../controllers/api/settings.api'

const router: Router = Router()

router.post('/toggle/:type', toggles)
router.get('/msg-type', messageType) // takes query

export default router