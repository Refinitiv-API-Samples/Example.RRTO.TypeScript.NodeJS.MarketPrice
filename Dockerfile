FROM node:14.16.1-alpine

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json .
RUN npm install
# Copy source
COPY src ./src
# Build app
COPY tsconfig.json .
COPY webpack.config.js .
RUN npx webpack
# Use shell script to support passing application name and its agruments to entrypoint
COPY run.sh ./run.sh
# Use shell script to support passing application name and its agruments to entrypoint
ENTRYPOINT [ "./run.sh" ]
#CMD ["node", "/market_price_streaming.js"]
