FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY generate_svg.js count.json ./

RUN npm install node-fetch@2

ENTRYPOINT ["node", "generate_svg.js"]
