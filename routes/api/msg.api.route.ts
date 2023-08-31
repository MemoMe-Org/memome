import { Router } from 'express'
import verifyUser from '../../middlewares/verifyUser'
import limit from '../../middlewares/limiter.middleware'
import upload from '../../middlewares/upload.middleware'
import sendMsg from '../../controllers/api/message.controller.api/send'
import anonUser from '../../controllers/api/message.controller.api/check'
import fetchMsg from '../../controllers/api/message.controller.api/fetch'
import editMsgVisibility from '../../controllers/api/message.controller.api/edit'

const router: Router = Router()

router.route(
    '/anon/:username',
).get(
    limit({
        max: 1,
        timerArr: [14, 9, 15],
        msg: 'Denied by Cheat System.'
    }),
    anonUser
).post(
    [
        upload.array('anon_files', 2),
        limit({
            max: 1,
            timerArr: [5, 9],
            msg: 'Duplicate message detected.'
        })
    ],
    sendMsg
)

router.get('/:userId', fetchMsg)
router.get(
    '/edit/:msgId',
    verifyUser,
    editMsgVisibility
)

export default router