FROM node:16

WORKDIR /app

ARG APP_SECRET
ENV APP_SECRET=${APP_SECRET}

COPY . .
RUN npm install -g typescript
RUN cd server; npm install
RUN cd server; npx tsc

CMD ["node", "--experimental-specifier-resolution=node", "server/server.js"]
