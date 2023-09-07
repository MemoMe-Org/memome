import { Router } from 'express'
import limit from '../../middlewares/limiter.middleware'
import upload from '../../middlewares/upload.middleware'
import verifyUser from '../../middlewares/verifyUser.middleware'
import sendMsg from '../../controllers/api/message.controller.api/send'
import fetchMsg from '../../controllers/api/message.controller.api/fetch'
import checkUser from '../../controllers/api/message.controller.api/check'
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
    checkUser
).post(
    [
        upload.array('anon_files', 4),
        limit({
            max: 1,
            timerArr: [5, 9],
            msg: 'Duplicate message detected.'
        })
    ],
    sendMsg
)

router.get('/:userId', fetchMsg)
router.put(
    '/edit/:msgId',
    verifyUser,
    editMsgVisibility
)

export default router