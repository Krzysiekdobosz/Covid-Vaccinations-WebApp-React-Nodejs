# Użyj obrazu Node.js jako bazowego
FROM node:14

# Ustaw katalog roboczy w kontenerze
WORKDIR /app

# Skopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm install

# Skopiuj pozostałe pliki aplikacji do katalogu roboczego
COPY . .

# Uruchom aplikację build
RUN npm run build

# Użyj obrazu serwera Nginx jako bazowego
FROM nginx:alpine

# Skopiuj pliki build do katalogu, z którego serwer Nginx serwuje pliki
COPY --from=0 /app/build /usr/share/nginx/html

# Otwórz port, na którym działa aplikacja
EXPOSE 80

# Uruchom serwer Nginx
CMD ["nginx", "-g", "daemon off;"]
