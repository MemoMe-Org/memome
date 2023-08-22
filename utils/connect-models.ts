import prisma from '../prisma'

const connectModels = async (id: string) => {
    await prisma.accounts.create({
        data: {
            user: {
                connect: { id }
            }
        }
    })

    await prisma.settings.create({
        data: {
            user: {
                connect: { id }
            }
        }
    })
}

export default connectModels