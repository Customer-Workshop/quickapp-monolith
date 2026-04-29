# ============================================
# Stage 1: Build Angular frontend
# ============================================
FROM node:22-alpine AS node-build

WORKDIR /src/quickapp.client
COPY quickapp.client/package.json quickapp.client/package-lock.json ./
RUN npm ci

COPY quickapp.client/ ./
RUN npm run build -- --configuration production

# ============================================
# Stage 2: Restore .NET dependencies
# ============================================
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS dotnet-restore

WORKDIR /src
COPY QuickApp.sln ./
COPY QuickApp.Server/QuickApp.Server.csproj QuickApp.Server/
COPY QuickApp.Core/QuickApp.Core.csproj QuickApp.Core/

# The .esproj is referenced in the solution; provide a stub so restore succeeds
COPY quickapp.client/quickapp.client.esproj quickapp.client/

RUN dotnet restore QuickApp.sln

# ============================================
# Stage 3: Publish .NET application
# ============================================
FROM dotnet-restore AS dotnet-publish

COPY QuickApp.Server/ QuickApp.Server/
COPY QuickApp.Core/ QuickApp.Core/

# Copy Angular build output so it is available during publish.
# The Angular builder outputs to dist/quickapp.client/browser/.
COPY --from=node-build /src/quickapp.client/dist/ quickapp.client/dist/

RUN dotnet publish QuickApp.Server/QuickApp.Server.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# Copy Angular build output into the published wwwroot directory
RUN cp -r quickapp.client/dist/quickapp.client/browser/* /app/publish/wwwroot/

# ============================================
# Stage 4: Runtime
# ============================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS runtime

WORKDIR /app
COPY --from=dotnet-publish /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "QuickApp.Server.dll"]
