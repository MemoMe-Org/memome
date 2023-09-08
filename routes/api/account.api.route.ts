import { Router } from 'express'
import account, {
    editDisability, editUsername
} from '../../controllers/api/account.api'

const router: Router = Router()

router.get('/', account)
router.post('/username', editUsername)
router.post('/disable', editDisability)

export default router