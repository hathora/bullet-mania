FROM node:18

WORKDIR /app

COPY . .
RUN cd common; npm ci
RUN cd server; npm ci
RUN cd server; npx tsc

CMD ["node", "--experimental-specifier-resolution=node", "server/server.js"]
