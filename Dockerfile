FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci
COPY client ./client
COPY shared ./shared
RUN npm run build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=4000
COPY package*.json ./
COPY client/package.json client/package.json
COPY server/package.json server/package.json
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/client/dist ./client/dist
COPY server/src ./server/src
COPY shared ./shared
RUN mkdir -p /app/server/uploads && chown -R node:node /app
USER node
EXPOSE 4000
CMD ["npm","start"]
