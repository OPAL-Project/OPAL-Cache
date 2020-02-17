# Select source image
FROM node:wheezy@sha256:794c4034813b36753287adadfbec041e4771989209d863c92aede7f16b584ed9

# Install all dependencies
RUN apt-get update -q && apt-get upgrade -y --no-install-recommends


# Create app directories
RUN mkdir -p /usr/app
WORKDIR /root

# We download the opal interface
RUN git clone -b master https://github.com/opal-project/opal-cache

WORKDIR /root/opal-cache

# Bundle app
RUN cp package.json /usr/app/ \
   && cp -r src /usr/app/src

WORKDIR /usr/app

# Install opal-interface npm dependencies
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Run compute service
EXPOSE 80
CMD [ "npm", "start" ]
