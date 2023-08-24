import { Router } from 'express'
import limit from '../../middlewares/limiter.middleware'
import anonUser from '../../controllers/api/anon-user.api'

const router: Router = Router()

router.get(
    '/anon/:username',
    limit({ max: 1, timerArr: [7, 9], msg: 'Denied by Cheat System.' }),
    anonUser
)

export default router