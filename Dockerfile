FROM node:14-slim

WORKDIR /usr/src/app/

COPY package.json /usr/src/app/package.json
COPY package-lock.json /usr/src/app/package.json
RUN npm install
COPY . /usr/src/app/
EXPOSE 3001
CMD ["node", "server.js"]