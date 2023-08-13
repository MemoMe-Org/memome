const { BUCKET_REGION, AWS_SECRET_ID, AWS_ACCESS_KEY } = process.env

const awsCredentials = {
    credentials: {
        accessKeyId: AWS_ACCESS_KEY!,
        secretAccessKey: AWS_SECRET_ID!
    },
    region: BUCKET_REGION!
}

export default awsCredentials