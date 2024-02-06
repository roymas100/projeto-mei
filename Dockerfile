FROM oven/bun

COPY bun.lockb . 
COPY package*.json . 

RUN bun install --frozen-lockfile

COPY . .

WORKDIR /usr/src/app

CMD ["bun", "run", "deploy"]