# here version 16 of node is used insted of 17 because of problems of compatibility with vue-cli
FROM node:16-slim 

#! this line needs to be changed in production once the build command is supported
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV

ARG PORT=4000
ENV PORT $PORT
# EXPOSE $PORT

## IMPOSTAZIONI DI DEFAULT DI NODE:
# install dependencies first, in a different location for easier app bind mounting for local development
# due to default /opt permissions we have to create the dir with root and change perms
RUN mkdir /opt/node_app && chown node:node /opt/node_app
WORKDIR /opt/node_app
# the official node image provides an unprivileged user as a security best practice
# but we have to manually enable it. We put it here so npm installs dependencies as the same
# user who runs the app.
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#non-root-user
USER node
COPY --chown=node:node package.json package-lock.json* ./
RUN  npm install @vue/cli && npm install --no-optional && npm cache clean --force
ENV PATH /opt/node_app/node_modules/.bin:$PATH

# copy in our source code last, as it changes the most
# copy in as node user, so permissions match what we need
WORKDIR /opt/node_app/app
COPY --chown=node:node . .

RUN npm run build
# CMD [ "npm", "run", "build" ] 
# the build comand create a /dist folder containing the website builded and ready for prod.

FROM httpd:2
# the --from=0 copy just builder source into the apache webroot 
# (instead of using webpack as for the default development env)
COPY --from=0 /opt/node_app/app/dist/ /usr/local/apache2/htdocs/
COPY --from=0 --chown=root:root /opt/node_app/app/apache_settings/.htaccess /usr/local/apache2/conf/.htaccess
COPY --from=0 --chown=root:root /opt/node_app/app/apache_settings/httpd.conf /usr/local/apache2/conf/httpd.conf
EXPOSE $PORT
