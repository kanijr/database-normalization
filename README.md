# Database Normalization Performance Research

This repository contains an experimental setup for researching how database normalization affects performance (inserts and selects) across different schema variants.

## Requirements
- PostgreSQL
- Node.js + npm

## Database setup
Create a PostgreSQL database (any name). Connect to it and execute all SQL scripts from the `sql/` folder manually (one by one, in dependency order).

Then open `api/src/db/index.js` and set the DB connection parameters (host/port/user/password/database) to match your PostgreSQL database.

## Start API
```bash
cd api
npm install
npm run dev
```

## Prepare tester
```bash
cd tester
npm install
```

## Run scripts (API must be running)
Run any of the following from the `tester/` directory:

```bash
npm run generate       # inserts equivalent datasets for all schemas
npm run generateN      # inserts only orders (new entities variant)
npm run generateNOrder # inserts only orders (existing entities variant)
npm run testOrders     # benchmarks order selects for each schema
npm run testPS         # benchmarks Products + Stock selects
```
