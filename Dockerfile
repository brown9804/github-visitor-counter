FROM node:20-alpine

WORKDIR /github/workspace

COPY package.json ./
RUN npm install

COPY generate_svg.js count.json ./

ENTRYPOINT ["node", "generate_svg.js"]
