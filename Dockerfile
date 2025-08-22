FROM node:20 AS builder
WORKDIR /usr/src/markdown
COPY package*.json ./
RUN npm install
COPY . .

FROM node:20-alpine

# To check health of container
RUN apk add --no-cache curl

WORKDIR /usr/src/markdown
COPY --from=builder /usr/src/markdown/node_modules ./node_modules
COPY --from=builder /usr/src/markdown/package.json ./
COPY --from=builder /usr/src/markdown/public ./public
COPY --from=builder /usr/src/markdown/views ./views
COPY --from=builder /usr/src/markdown/index.js ./

EXPOSE 2723
CMD ["npm", "start"]
