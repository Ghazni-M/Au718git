FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Build the app
RUN npm run build

EXPOSE 3000

# Start the server
CMD ["npm", "start"]
