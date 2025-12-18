Create a PostgreSQL database (choose any name), then connect to it and run all SQL scripts from the sql/ folder against this database (manually, one by one, in the correct dependency order). After that, open api/src/db/index.js and set the connection settings (host/port/user/password/database) to match the database you created.

Start the API:

cd api
npm install
npm run dev (starts the Express.js server)

Prepare the tester project:

cd tester
npm install

With the API running, run any script below from tester/:

npm run generate — inserts equivalent/consistent datasets for all schemas used in the research.
npm run generateN — inserts only orders using the “new entities” variant (normalized order model).
npm run generateNOrder — inserts only orders using existing entities (baseline entities, order-only scenario).
npm run testOrders — benchmarks order queries (select tests) for each normal form/schema.
npm run testPS — benchmarks product/stock queries (Products + Stock select tests).