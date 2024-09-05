# Use an official Node.js runtime as a parent image
FROM node:22

# Set the working directory in the container
WORKDIR /app/vue

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Copy the build-icons.js file to ensure it exists before npm install
COPY src/@iconify src/@iconify/

# Install dependencies
RUN npm cache clean --force && npm install --verbose

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the app
CMD ["npm", "run", "dev"]
