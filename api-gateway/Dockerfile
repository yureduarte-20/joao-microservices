FROM node:18.13.0-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install
COPY . .
RUN npx tsc -p .
ENV HOST=0.0.0.0 PORT=3000
EXPOSE ${PORT}
RUN echo ${PORT}
CMD [ "node", "dist/index.js" ]
#CMD ["npm", "run", "dev"]