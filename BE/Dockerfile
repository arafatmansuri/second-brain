# ---------- Stage 1: Build TypeScript ----------
FROM node:22-alpine AS builder

WORKDIR /user/src/app
COPY package*.json ./
RUN npm install
RUN npm install typescript
COPY . .
RUN npm run build

# ---------- Stage 2: Final Runtime with Python ----------
FROM python:3.11-slim AS runtime

# Install Node.js in Python base image
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /user/src/app
# Copy only necessary files from builder
COPY --from=builder /user/src/app/package*.json ./
COPY --from=builder /user/src/app/dist ./dist
COPY --from=builder /user/src/app/.env ./.env
COPY --from=builder /user/src/app/newrelic.js ./newrelic.js

# Install only production dependencies
RUN npm install --omit=dev

# Copy Python requirements (if any)
RUN python3 -m venv venv
# RUN source venv/bin/activate
RUN pip install --upgrade pip
# COPY requirements.txt ./
# RUN pip install --no-cache-dir -r requirements.txt
RUN pip install pymupdf
RUN pip install requests
RUN pip install boto3
RUN pip install dotenv
RUN pip install youtube-transcript-api

# Copy any Python scripts
# COPY scripts ./scripts

# Expose port (if Node server)
EXPOSE 3000

# Start Node.js app
CMD ["npm", "start"]