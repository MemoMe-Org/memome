import { Router } from 'express'
import upload from '../../middlewares/upload.middleware'
import verifyUser from '../../middlewares/verifyUser.middleware'
import { vote } from '../../controllers/api/poll.controller.api/vote'
import { poll } from '../../controllers/api/poll.controller.api/poll'
import { create } from '../../controllers/api/poll.controller.api/create'
import fetchUserPolls from '../../controllers/api/poll.controller.api/fetch'
import limit from '../../middlewares/limiter.middleware'

const router: Router = Router()

router.use(verifyUser)

router.post(
    '/create',
    upload.array('poll_files', 4),
    create
)
router.get(
    '/get/:createdById/:pollId',
    limit({
        max: 1,
        timerArr: [14, 15, 19],
        msg: 'Denied by Cheat System.'
    }),
    poll
)

router.get('/fetch/:username', fetchUserPolls)

router.post('/vote/:createdById/:pollId/:optionId', vote)


export default router