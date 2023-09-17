import { Router } from 'express'
import upload from '../../middlewares/upload.middleware'
import verifyUser from '../../middlewares/verifyUser.middleware'
import { vote } from '../../controllers/api/poll.controller.api/vote'
import { poll } from '../../controllers/api/poll.controller.api/poll'
import { create } from '../../controllers/api/poll.controller.api/create'
import fetchUserPolls from '../../controllers/api/poll.controller.api/fetch'

const router: Router = Router()

router.use(verifyUser)

router.post(
    '/create',
    upload.array('poll_files', 4),
    create
)
router.get('/get/:createdById/:pollId', poll)

router.get('/fetch/:username', fetchUserPolls)

router.post('/vote/:createdById/:pollId/:optionId', vote)


export default router