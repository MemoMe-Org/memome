declare namespace NodeJS {
    interface ProcessEnv {
        TEXT_KEY: string
        JWT_SECRET: string
        CLIENT_URL: string
        BUCKET_NAME: string
        DIST_DOMAIN: string
        DATABASE_URL: string
        BUCKET_REGION: string
        AWS_SECRET_ID: string
        PLUNK_API_KEY: string
        SESSION_SECRET: string
        AWS_ACCESS_KEY: string
        GOOGLE_CLIENT_ID: string
        GITHUB_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string
        GITHUB_CLIENT_SECRET: string
        NODE_ENV: 'production' | 'development'
    }
}