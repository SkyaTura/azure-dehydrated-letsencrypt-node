FROM node:11

RUN apt-get update
RUN apt-get install -y \
      curl \
      apt-transport-https \
      lsb-release \
      gnupg
RUN curl -sL https://packages.microsoft.com/keys/microsoft.asc | \
    gpg --dearmor | \
    tee /etc/apt/trusted.gpg.d/microsoft.asc.gpg > /dev/null
RUN AZ_REPO=$(lsb_release -cs) && echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | \
    tee /etc/apt/sources.list.d/azure-cli.list
RUN apt-get update
RUN apt-get install -y azure-cli
RUN apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD npm start
