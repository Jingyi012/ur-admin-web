# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY ClientApp/package*.json ./ClientApp/
RUN cd ClientApp && npm install
COPY ClientApp ./ClientApp
RUN cd ClientApp && npm run build

# Stage 2: Build the .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ur-admin-web.sln .
COPY ur-admin-web.csproj ./
COPY . ./
RUN dotnet restore ur-admin-web.csproj
RUN dotnet publish ur-admin-web.csproj -c Release -o /app/publish

# Stage 3: Copy frontend into backend's wwwroot and run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Copy backend build output
COPY --from=build /app/publish .

# Copy built React frontend into wwwroot
COPY --from=frontend-build /app/ClientApp/dist ./wwwroot

# Port (change if your app uses another)
EXPOSE 8080

ENTRYPOINT ["dotnet", "ur-admin-web.dll"]
