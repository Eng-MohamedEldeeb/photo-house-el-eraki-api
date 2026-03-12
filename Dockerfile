FROM node:25

WORKDIR /app
COPY package.json .

RUN npm i

COPY . .

ARG PORT=3000
EXPOSE ${PORT}
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["npm", "start"]