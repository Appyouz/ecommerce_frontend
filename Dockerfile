# 1. Base Image: Start from an official Node.js image
FROM node:18-alpine

# 2. Set Working Directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json to install dependencies
# We copy these first to leverage Docker's build cache.
# If these files don't change, Docker won't re-run npm install.
COPY package.json package-lock.json ./

# 4. Install Node.js dependencies
# npm ci is preferred for CI/CD and Docker builds as it uses package-lock.json strictly
RUN npm ci

# 5. Copy the rest of the application code
# This copies all your Next.js source files into the container.
COPY . .

# 6. Expose the port Next.js development server runs on (default is 3000)
EXPOSE 3000

# 7. Define the command to run the Next.js application in development mode
# For production, you'd typically run `npm run build` first, then `npm start`
CMD ["npm", "run", "dev"]
