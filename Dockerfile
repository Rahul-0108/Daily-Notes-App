# Base Image
FROM node:latest

# Create directory in container image for app code
RUN mkdir -p /usr/src/app

# Copy app code (.) to /usr/src/app in container image . We should run the build Command from the Directory where the Whole Source Code is Available
COPY . /usr/src/app

# Set working directory context
WORKDIR /usr/src/app

# Install dependencies from packages.json
RUN npm install

# Start the Application
CMD ["npm", "start"]