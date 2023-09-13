import { Router } from 'express'
import account, {
    editDisability, editUsername, editPswd
} from '../../controllers/api/account.api'

const router: Router = Router()

router.get('/', account)
router.patch('/reset-pswd', editPswd)
router.patch('/username', editUsername)
router.patch('/disable', editDisability)

export default router