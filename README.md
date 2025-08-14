# SAP Service Layer Deno Client

Small Deno + TypeScript helpers for the SAP Service Layer API.  
Handles session auth, API requests, and DFS traversal of product trees.

## Features
- Session authentication with local cache
- Simple wrappers for common endpoints
- Depth‑First Search (stack) traversal of product trees
- TypeScript type safety

## Requirements
- [Deno](https://deno.land/) (latest stable)
- `.env` file:
```
      SAP_SERVER_BASE_URL=https://example.com:50000/b1s/v1
      SAP_COMPANY_DB=YourCompanyDB
      SAP_USERNAME=YourUser
      SAP_PASSWORD=YourPass
```

## Run
    deno run --allow-net --allow-read --allow-write main.ts

## Test
    deno test --allow-net --allow-read
