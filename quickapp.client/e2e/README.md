# Playwright end-to-end tests

Start SQL Server locally:

```bash
docker run -d --name quickapp-mssql -e ACCEPT_EULA=Y -e MSSQL_SA_PASSWORD=QuickApp@Pass123 -p 1433:1433 mcr.microsoft.com/mssql/server:2022-latest
```

From `quickapp.client`, set `ConnectionStrings__DefaultConnection` to the SQL Server connection string and run `npm run test:e2e`. The Playwright web servers start the API and SPA automatically.

Use `BASE_URL` or `PLAYWRIGHT_BASE_URL` to change the SPA URL, `API_URL` to change the API URL, or `SKIP_WEBSERVER=1` when both servers are already running. The HTML report is written to `quickapp.client/playwright-report`.
