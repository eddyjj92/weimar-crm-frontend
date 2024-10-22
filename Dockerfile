# Usamos una imagen base de Node.js para compilar Quasar
FROM node:20 AS build-stage

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiamos los archivos de la aplicación Quasar
COPY package*.json ./
COPY . .

# Instalamos las dependencias y compilamos la aplicación para producción
RUN npm install -g @quasar/cli
RUN npm install
RUN quasar build -m pwa

# Usamos una imagen de Apache para servir los archivos estáticos de Quasar
FROM httpd AS production-stage

# Copiamos los archivos compilados desde la etapa anterior al directorio de Apache
COPY --from=build-stage /app/dist/pwa/ /usr/local/apache2/htdocs/

# Configuramos Apache con un archivo custom si es necesario
COPY ./httpd.conf /usr/local/apache2/conf/httpd.conf

# Exponemos el puerto 80 para servir la aplicación
EXPOSE 80

CMD ["httpd-foreground"]