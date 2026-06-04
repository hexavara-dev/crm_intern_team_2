# Getting Started with Hexavara CRM

Welcome to the development environment for Hexavara CRM! This document outlines how to spin up our PostgreSQL database alongside the Express NodeJS REST API via Docker Compose.

## Prerequisites

- **Docker & Docker Compose:** Ensure you have the Docker desktop daemon running.
- **Node.js (v18+)** (for local CLI tooling, though Docker handles runtime)

## Startup Process

1. **Spin Up the Containers**  
   From the `hexavara-crm` directory, build and run the combined environments:

   ```bash
   docker compose up --build -d
   ```

   This will boot two detached containers:
   - `hexavara_crm_db`: A `postgres:15-alpine` instance mapped to port 5432.
   - `hexavara_crm_api`: A Node.js container compiling your Prisma schema, starting Express via Typescript (`tsx`), mapped to port 3000.

2. **Push the Prisma Schema to Database**  
   Because the database starts empty, you must push your Prisma schema mapping to the running container once:

   ```bash
   npx prisma db push
   ```

   > **Note:** If you run into connectivity issues locally running Prisma, you can execute it securely from directly inside the API container:
   > `docker exec hexavara_crm_api npx prisma db push`

3. **Verify API Connectivity**  
   Your Express backend routes all requests strictly dynamically via Clean Architecture dependency mappings.
   - Run a health check: `curl http://localhost:3000/health`. You should receive a status 'ok' JSON payload message.

4. **Iterate and Develop**  
   `nodemon` tracks changes. If you create new Clean Architecture domains in `src/`, Docker will reload the `index.ts` logic automatically.

---

### Exploring Data

For viewing your schema effectively outside API calls, consider employing the **Prisma Studio** locally pointing to your identical Localhost port `5432` credentials defined in `docker-compose.yml`:

```bash
npx prisma studio
```

Check the mappings generated inside the `todos/` folder for all endpoints created dynamically on boot!
