import { Response } from 'express'
import { sendError } from './sendRes'
import MaxSize from '../enums/fileMaxSizes'
import StatusCodes from '../enums/StatusCodes'

/*
mb - megabit * 1000
MB - megabyte * 1024
*/

const handleFile = (res: Response, file: any, maxSize: MaxSize): any => {
    const size: number = file.size
    if (size < maxSize) {
        const extension = file.originalname.split('.').pop()
        return { ...file, extension }
    } else {
        sendError(
            res,
            StatusCodes.PayloadTooLarge,
            `${file.originalname} is too large. > ${maxSize} bytes.`
        )
        return
    }
}

export default handleFile