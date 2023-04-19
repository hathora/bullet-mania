FROM node:18

WORKDIR /app

COPY . .
RUN cd common; npx tsc
RUN cd server; npm ci
RUN cd server; npx tsc

CMD ["node", "--experimental-specifier-resolution=node", "server/server.js"]
