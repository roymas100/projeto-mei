declare interface Usersadsa {
    name: string
    phone: string
    email?: string
    password?: string
    has_confirmed_phone?: boolean
    confirmation_token?: number
    token_expiration?: Date
}