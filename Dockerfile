FROM node:20-alpine

WORKDIR /app

COPY generate_svg.js update-counter.js count.json ./

RUN npm install node-fetch

ENTRYPOINT ["node", "update-counter.js"]
