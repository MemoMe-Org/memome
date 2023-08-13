declare namespace NodeJS {
    interface ProcessEnv {
        JWT_SECRET: string
        SESSION_SECRET: string
        GOOGLE_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string
        NODE_ENV: 'production' | 'development'
    }
}