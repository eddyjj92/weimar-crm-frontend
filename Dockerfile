# Etapa 1: Instalación de las dependencias y construcción de la aplicación Quasar
FROM node:20-alpine AS build-stage

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de configuración y el package.json
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Instala la CLI de Quasar globalmente
RUN npm install -g quasar

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación
RUN quasar build -m pwa

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:alpine

# Copia los archivos de salida de la construcción a la carpeta de Nginx
COPY --from=build-stage /app/dist/pwa /usr/share/nginx/html

# Copia el archivo de configuración de Nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
