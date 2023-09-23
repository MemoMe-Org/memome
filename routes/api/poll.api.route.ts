import { Router } from 'express'
import upload from '../../middlewares/upload.middleware'
import limit from '../../middlewares/limiter.middleware'
import verifyUser from '../../middlewares/verifyUser.middleware'
import { vote } from '../../controllers/api/poll.controller.api/vote'
import { poll } from '../../controllers/api/poll.controller.api/poll'
import { edit } from '../../controllers/api/poll.controller.api/edit'
import { create } from '../../controllers/api/poll.controller.api/create'
import fetchUserPolls from '../../controllers/api/poll.controller.api/fetch'
import { deletePoll } from '../../controllers/api/poll.controller.api/delete'

const router: Router = Router()

router.post(
    '/create',
    [
        verifyUser,
        upload.array('poll_files', 4),
    ],
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

router.patch('/edit/:pollId/:type', verifyUser, edit)

router.delete('/delete/:pollId', verifyUser, deletePoll)

router.get('/fetch/:username', verifyUser, fetchUserPolls)

router.post('/vote/:createdById/:pollId/:optionId', verifyUser, vote)


export default router