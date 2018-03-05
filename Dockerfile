FROM node:8.9.4-alpine

LABEL maintainer "support@chomchob.com"

COPY ["package*.json", "/app/"]

WORKDIR /app

ARG NPM_TOKEN
ARG NODE_ENV
ENV BIND_PORT=3000 \
  NODE_ENV=${NODE_ENV} \
  NODE_GYP=0 \
  INSTALL_GIT=0

RUN set -ex; \
  apk add --no-cache tini; \
  \
  # for node-gyp
  if [ "${NODE_GYP}" = "1" ]; then \
    apk add --no-cache make gcc g++ python; \
  fi; \
  if [ "${INSTALL_GIT}" = "1" ]; then \
    apk add --no-cache git; \
  fi; \
  \
  \
  # install dependencies
  if [ "${NODE_ENV}" = "develop" ]; then \
    npm install; \
  else \
    npm install --production; \
  fi; \
  \
  # clean up
  if [ "${NODE_GYP}" = "1" ]; then \
    apk del make gcc g++ python; \
  fi; \
  if [ "${INSTALL_GIT}" = "1" ]; then \
    apk del git; \
  fi; \
  rm -rf ~/.npmrc;

# Tini is now available at /sbin/tini
ENTRYPOINT ["/sbin/tini", "--"]

# copy source files
COPY . /app

EXPOSE 3000

USER node

CMD ["node", "index.js"]
