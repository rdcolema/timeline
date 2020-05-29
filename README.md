# Timeline

Mapping historical Wikipedia events geographically and temporally with React

<img src="https://github.com/rdcolema/timeline/blob/master/assets/sample.jpg" />

## Installation

Requires: docker-compose and a mapbox account w/ API token

After cloning the directory, navigate to the project root and create a .env file with the following key/value pairs:

```
REACT_APP_MAPBOX_TOKEN=your api token

REACT_APP_SERVER_PORT=your container server port
SERVER_PORT=your host server port
CLIENT_PORT=your host client port

MYSQL_USER=your username
MYSQL_DATABASE=timelinedb
MYSQL_PASSWORD=your password
MYSQL_HOST=localhost
MYSQL_ROOT_PASSWORD=your mysql root password
MYSQL_PORT=your host mysql port
```

You may need to adjust some values in the "docker-compose.yml" file in the project root if there are any port conflicts in your environment or would like to connect to a different database. 

Then run:
`$ docker-compose build`
`$ docker-compose up -d`

This should build the docker images and run the containers locally for the server, the client, and the mysql database. 

Finally navigate to "http://localhost:<CLIENT_PORT>/" to view the running app, replacing <CLIENT_PORT> with the value used for that variable.
