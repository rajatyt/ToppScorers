# ------------------------------------------------------------------------------
# Stage 1: Build Client (React + Vite)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

ARG VITE_GOOGLE_CLIENT_ID=1024664791682-3g3ii0da3tg3fmsk8p9gc3i4pstcecos.apps.googleusercontent.com
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY client/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Server & Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install server production dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy server application
COPY server/ ./

# Copy built frontend assets from client-builder into /app/client/dist
COPY --from=client-builder /app/client/dist /app/client/dist

# Ensure uploads directory exists
RUN mkdir -p uploads

# Cloud Run defaults to container port 8080
EXPOSE 8080

CMD ["node", "server.js"]
