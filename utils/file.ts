import { Response } from 'express'
import { sendError } from './sendRes'
import StatusCodes from './StatusCodes'

const handleFile = (res: Response, file: any): any => {
    const maxSize: number = 5242880
    const size: number = file.size
    if (size < maxSize) {
        const extension = file.originalname.split('.').pop()
        return { ...file, extension }
    } else {
        sendError(res, StatusCodes.PayloadTooLarge, 'Image size is too large > 5MB.')
        return
    }
}

export default handleFile