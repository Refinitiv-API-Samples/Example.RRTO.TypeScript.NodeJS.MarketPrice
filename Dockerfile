# Builder stage, for building the source code only
FROM node:14.16.1-alpine as builder

# Create app directory
WORKDIR /app

# Install app dependencies and build configurations
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json .
COPY tsconfig.json .
COPY webpack.config.js .

# Copy source
COPY src ./src
#RUN npm install
RUN npm install
# Build app
RUN npm run build

## Second stage, for running the application in a final image.

FROM node:14.16.1-alpine

# Create app directory
WORKDIR /app
# Copy the bundle file and run script

COPY --from=builder /app/dist ./dist
COPY run.sh ./run.sh

# Use shell script to support passing application name and its agruments to entrypoint
ENTRYPOINT [ "./run.sh" ]
