FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm ci

COPY generate_svg.js count.json ./

ENTRYPOINT ["node", "generate_svg.js"]
