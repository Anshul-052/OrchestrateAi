FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Expose port
EXPOSE 3000

# Start command uses development server for hot reloading
CMD ["npm", "run", "dev"]
