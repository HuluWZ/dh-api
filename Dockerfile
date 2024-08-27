# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.12.2
ARG PNPM_VERSION=8.15.6

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

# Install pnpm.
RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/app

# Copy package.json and pnpm-lock.yaml before installing dependencies
COPY package.json pnpm-lock.yaml ./
# Install dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy the rest of the source files into the image
COPY . .

# Run Prisma generate command
RUN npx prisma generate


RUN npx nest build

# Expose the port that the application listens on
EXPOSE 8000

# Run the application
CMD ["pnpm", "start:prod"]
