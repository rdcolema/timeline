# Timeline

Mapping historical Wikipedia events geographically and chronologically with React

<img src="https://github.com/rdcolema/timeline/blob/master/assets/sample.jpg" />

## Installation

### Requires:
docker-compose and a mapbox account w/ API token

### Local Run:
After cloning the directory, navigate to the project root and create a .env file with the following key/value pairs:

```
REACT_APP_MAPBOX_TOKEN = your mapbox api token

REACT_APP_SERVER_PORT = port exposed by the server container
CLIENT_PORT = port exposed by the client container

MYSQL_USER = username for client to use when querying mysql db
MYSQL_PASSWORD = secure password for client to use when querying mysql db
MYSQL_DATABASE = timelinedb
MYSQL_HOST = localhost
MYSQL_ROOT_PASSWORD = secure password for root user in mysql container
MYSQL_PORT = port exposed by mysql container
```

You may need to adjust some values in the "docker-compose.yml" file in the project root if there are any port conflicts in your environment or would like to connect to a different database.

Then run: </br>
`$ docker-compose build` </br>
`$ docker-compose up -d`

This should build the docker images and run the containers locally for the server, the client, and the mysql database.

Finally navigate to "localhost:<CLIENT_PORT>" in your browser to view the running app, replacing <CLIENT_PORT> with the value used for that variable.
