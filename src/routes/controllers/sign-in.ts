import { t } from "elysia"
import { makeSignIn } from "../../use-case/factories/makeSignIn"

export const signInBodySchema = t.Object({
    phone: t.String({
        examples: ['+5571999666333'],
        error: 'Must be a string'
    }),
    password: t.String({
        examples: ['123456'],
        error: 'Must have more than 6 of length size',
        minLength: 6
    }),
})

interface SignInParams {
    request: Request,
    body: {
        phone: string,
        password: string,
    }
}

export async function signIn({ request, body: { password, phone } }: SignInParams) {
    const signIn = makeSignIn()

    const { user } = await signIn.execute({
        phone,
        password,
    })

    return { user, token: null }
}