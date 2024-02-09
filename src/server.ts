import { Elysia } from "elysia";
import { routes } from "./routes/routes";
import { plugins } from "./plugins";

const server = new Elysia().use(routes).use(plugins.pos_render_plugins).use(plugins.swaggerPlugin)

server.listen(Bun.env.PORT)

console.log(`Listening on http://localhost:${Bun.env.PORT} ...`);
