# Użyj obrazu Node.js jako bazowego
FROM node:14

# Ustaw katalog roboczy w kontenerze
WORKDIR /app

# Skopiuj pliki package.json i package-lock.json
COPY package*.json ./

# Zainstaluj zależności
RUN npm install
RUN npm install bcryptjs


# Skopiuj pozostałe pliki aplikacji do katalogu roboczego
COPY . .

# Ustaw zmienną środowiskową dla portu
ENV PORT=5000

# Otwórz port, na którym działa aplikacja
EXPOSE 5000

# Uruchom aplikację
CMD ["node", "server.js"]
