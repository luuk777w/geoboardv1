FROM mcr.microsoft.com/dotnet/core/sdk:2.1 AS build-env
WORKDIR /GeoBoard

# Copy csproj and restore as distinct layers
COPY GeoBoard.sln ./
COPY ./GeoBoard/*.csproj ./GeoBoard/
RUN dotnet restore

# Copy everything else and build
COPY . .
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:2.1
WORKDIR /GeoBoard
EXPOSE 5000
COPY --from=build-env /GeoBoard/out .
ENTRYPOINT ["dotnet", "GeoBoard.dll"]
