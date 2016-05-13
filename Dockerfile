FROM node:6.0.0
MAINTAINER github.com/dotlouis

# Setup environment variables
ENV WORK_DIR /usr/workspace/
ENV APP_DIR $WORK_DIR/app/
ENV APP_PORT 3000

# Create app directory and parents
RUN mkdir -p $APP_DIR

# We add package.json first so that the  docker image build
# can use the cache as long as contents of package.json
# hasn't changed.
WORKDIR $WORK_DIR
COPY package.json $WORK_DIR
RUN npm install

# Bundle app source
COPY . $APP_DIR
WORKDIR $APP_DIR

EXPOSE $APP_PORT

CMD ["npm","start"]
