import { makeGenerateAuthToken } from "../../use-case/factories/makeGenerateAuthToken"
import { t } from "elysia"

export const generateTokenParamsSchema = t.Object({
    user_id: t.String({
        examples: ['xxxxx-xxxxx-xxxxx-xxxxx'],
        error: 'Bad request'
    }),
})

interface GenerateTokenParams {
    request: Request,
    params: {
        user_id: string,
    }
}

export async function generateToken({ request, params: {
    user_id
} }: GenerateTokenParams) {
    const registerUser = makeGenerateAuthToken()

    const { user } = await registerUser.execute(user_id)

    return {
        user
    }
}