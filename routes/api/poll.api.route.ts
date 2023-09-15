import { Router } from 'express'
import verifyUser from '../../middlewares/verifyUser.middleware'
import { create } from '../../controllers/api/poll.controller.api/create'
import upload from '../../middlewares/upload.middleware'

const router: Router = Router()


router.post(
    '/create',
    [
        verifyUser,
        upload.array('poll_files', 4)
    ],
    create
)

export default router