import { Elysia } from "elysia";
import { plugins } from "../../plugins";

const verifyTokenPlugin = new Elysia().use(plugins.pre_render_plugins).derive(async ({ jwt, bearer }) => {
    const payload = await jwt.verify(bearer)

    return {
        user_id: payload ? payload.user_id : null,
        isAuthenticated: !!payload
    }
}).onBeforeHandle(async ({ set, isAuthenticated }) => {
    if (!isAuthenticated) {
        set.status = 401
        set.headers[
            'WWW-Authenticate'
        ] = `Bearer realm='sign', error="invalid_request"`

        return new Response('Unauthorized', {
            status: 401
        })
    }
})

export const middlewares = {
    verifyTokenPlugin
}