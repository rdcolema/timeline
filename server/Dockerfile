FROM node:10-alpine

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY package-lock.json /app
COPY . /app

RUN npm install

RUN apk add --no-cache --virtual .build-deps g++ \
	python3-dev libffi-dev openssl-dev mariadb-dev && \
    apk add --no-cache --update python3 && \
    pip3 install --upgrade pip setuptools
RUN pip3 install SQLAlchemy==1.3.17 pandas==1.0.3 \
	requests==2.23.0 mysqlclient==1.4.6

CMD ["npm", "start"]
