FROM node:20-alpine

# pg_isready lives in postgresql-client
RUN apk add --no-cache postgresql-client openssl

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Generate Prisma client & build Next.js
RUN npx prisma generate
RUN npm run build

COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

CMD ["sh", "start.sh"]
