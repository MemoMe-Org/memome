import { Router } from 'express'
import account, {
    editDisability, editUsername, editPswd
} from '../../controllers/api/account.api'

const router: Router = Router()

router.get('/', account)
router.put('/reset-pswd', editPswd)
router.put('/username', editUsername)
router.put('/disable', editDisability)

export default router