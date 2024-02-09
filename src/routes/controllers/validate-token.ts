import { makeValidateAuthToken } from "../../use-case/factories/makeValidateAuthToken"
import { t } from "elysia"

export const validateTokenBodySchema = t.Object({
    token: t.Number({
        examples: ['123456'],
        error: 'Bad request'
    }),
})

export const validateTokenParamsSchema = t.Object({
    user_id: t.String({
        examples: ['xxxxx-xxxxx-xxxxx-xxxxx'],
        error: 'Bad request'
    }),
})

interface ValidateTokenParams {
    request: Request,
    body: {
        token: number,
    }
    params: {
        user_id: string,
    }
}

export async function validateToken({ request, body: { token }, params: { user_id } }: ValidateTokenParams) {
    const registerUser = makeValidateAuthToken()

    const { user } = await registerUser.execute({
        token,
        user_id
    })

    return {
        user,
        token: null
    }
}