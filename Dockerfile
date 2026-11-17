# Khet Se web — production image (Next.js standalone output)
# Build:  docker build -t khet-se-web --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api ./client
# Run:    docker run -p 3000:3000 -e API_INTERNAL_URL=http://api:5000/api khet-se-web
#
# NEXT_PUBLIC_API_URL is compiled into the browser bundle, so it is a *build* argument.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1
CMD ["node", "server.js"]
