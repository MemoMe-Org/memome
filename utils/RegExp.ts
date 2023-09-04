// const EMAIL_REGEX: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_REGEX: RegExp = /^[^\s@]+@(gmail\.com|yahoo\.com|outlook\.com|icloud\.com|fastmail\.com)$/i;

const restrictedUser: string[] = [
    "profile", "admin", "account", "api", "root", "wp-admin", "user",
    "signup", "login", "edit", "password", "reset", "logout", "memome"
]
const restrictedWordsPattern = `^(?!(${restrictedUser.join('|')}))`

const USER_REGEX: RegExp = new RegExp(restrictedWordsPattern + /^[a-zA-Z][a-zA-Z0-9-_]{2,32}$/)

const PSWD_REGEX: RegExp = /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{7,89}$/

export { EMAIL_REGEX, USER_REGEX, PSWD_REGEX }