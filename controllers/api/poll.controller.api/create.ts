import prisma from '../../../prisma'
import { Request, Response } from 'express'
import handleFile from '../../../utils/file'
import MaxSize from '../../../enums/fileMaxSizes'
import genFileName from '../../../utils/genFileName'
import StatusCodes from '../../../enums/StatusCodes'
import expressAsyncHandler from 'express-async-handler'
import { deleteS3, getS3, uploadS3 } from '../../../utils/s3'
import { sendError, sendSuccess } from '../../../utils/sendRes'


const create = expressAsyncHandler(async (req: Request, res: Response) => {
    // @ts-ignore
    const userId = req.userId
    let { title, options } = req.body

    title = title?.trim() || ''
    options = options?.filter(String)

    let filesArr: any[] = []
    let files = req.files as any[] || []

    if (options?.length < 2) {
        sendError(res, StatusCodes.BadRequest, 'Poll requires a minimum of 2 options.')
        return
    }

    if (options?.length > 10) {
        sendError(res, StatusCodes.BadRequest, 'Poll requires a maximum of 10 options.')
        return
    }

    const optionsExceedMaxLength = options.some((option: string) => option.length > 42)

    if (optionsExceedMaxLength) {
        sendError(res, StatusCodes.BadRequest, 'Some options exceed the maximum length of 42 characters.')
        return
    }

    if (title && title.length > 267) {
        sendError(res, StatusCodes.BadRequest, 'Poll title exceeds the maximum length of 267 characters.')
        return
    }

    if (files.length > 2) {
        sendError(res, StatusCodes.PayloadTooLarge, 'Only a maximum of two (2) files is allowed.')
        return
    }

    const user = await prisma.users.findUnique({
        where: {
            id: userId
        }
    })

    if (!user) {
        sendError(res, StatusCodes.NotFound, 'User not found.')
        return
    }

    const poll = await prisma.poll.create({
        data: {
            title,
            date: new Date().toISOString(),
            createdBy: {
                connect: {
                    id: user.id
                }
            }
        }
    })

    try {
        filesArr = await Promise.all(files.map(async (file: File) => {
            const tempFile = await handleFile(
                res,
                file,
                MaxSize['9MB'],
                'jpg', 'png', 'mp4'
            )
            const type = tempFile.mimetype
            const path = `Poll/${user.id}/${poll.id}/${genFileName()}.${tempFile.extension}`
            await uploadS3(tempFile.buffer, path, type)
            const url = await getS3(path)
            return { path, url, type }
        }))
    } catch {
        try {
            if (filesArr.length > 0) {
                for (const file of filesArr) {
                    await deleteS3(file?.path)
                }
            }
            filesArr = []
        } catch {
            sendError(res, StatusCodes.BadRequest, 'Something went wrong.')
            return
        }
    }

    await prisma.poll.update({
        where: {
            id: poll.id,
        },
        data: {
            files: filesArr
        }
    })

    for (const option of options) {
        await prisma.option.create({
            data: {
                texts: option,
                poll: {
                    connect: {
                        id: poll.id
                    }
                }
            }
        })
    }

    await prisma.profiles.update({
        where: { userId },
        data: {
            poll_point: {
                increment: filesArr.length > 0 ? 0.75 : 0.6
            }
        }
    })

    sendSuccess(res, StatusCodes.Created, {
        url: `https://memome.one/poll/${user.id}/${poll.id}`
    })
})

export { create }