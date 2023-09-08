import { Router } from 'express'
import {
    editDisability, editUsername
} from '../../controllers/api/account.api'

const router: Router = Router()

router.post('/username', editUsername)
router.post('/disable', editDisability)

export default router