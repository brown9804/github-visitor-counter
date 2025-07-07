FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY generate_svg.js count.json ./

RUN npm install

ENTRYPOINT ["node", "generate_svg.js"]
