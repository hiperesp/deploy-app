# Imagem base do Node.js
FROM node:18.15.0

# Diretório de trabalho do aplicativo
WORKDIR /app

# Copiar arquivos do projeto para o diretório de trabalho
COPY src /app

# Instalar as dependências do Node.js
RUN npm ci

# Expor a porta 3000 para o mundo exterior
EXPOSE 3000

# Iniciar o aplicativo
CMD ["npm", "start"]