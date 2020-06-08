FROM node:latest

ENV NODE_ENV=production
ENV PORT=8080

COPY . /var/www
WORKDIR /var/www



RUN npm install

EXPOSE 8080

ENTRYPOINT [ "node","server.js" ]