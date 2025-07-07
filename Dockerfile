FROM node:20-alpine

WORKDIR /app

COPY generate_svg.js count.json ./

RUN npm install node-fetch

ENTRYPOINT ["node", "generate_svg.js"]
