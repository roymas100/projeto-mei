import { server } from "./routes/routes";

server.listen(Bun.env.PORT)

console.log(`Listening on http://localhost:${Bun.env.PORT} ...`);
