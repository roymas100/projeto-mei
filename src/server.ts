import routes from "./routes/routes";

const server = Bun.serve({
    port: Bun.env.PORT,
    fetch: routes,
});

console.log(`Listening on http://localhost:${server.port} ...`);
