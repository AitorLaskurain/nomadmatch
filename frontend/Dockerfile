FROM node:18-alpine

WORKDIR /app

RUN npm install -g live-server

COPY public/ /app/public/

EXPOSE 3000

CMD ["live-server", "public", "--port=3000", "--host=0.0.0.0", "--no-browser"]
