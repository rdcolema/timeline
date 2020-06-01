import os
import time
import logging
import requests
import pandas as pd
from sqlalchemy import create_engine

SPARQL_URL = "http://dbpedia.org/sparql"
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)


def get_events():
	"""Fetches dataframe of events from dbpedia via sparql"""
	offset = 0

	query = """
	    PREFIX dbo: <http://dbpedia.org/ontology/>
	    PREFIX n1: <http://www.w3.org/2003/01/geo/wgs84_pos#>
	    SELECT 
	        (?Event_69 AS ?event) 
	        (?date_89 AS ?date) 
	        (AVG(?place_lat_158) AS ?latitude) 
	        (AVG(?place_long_159) AS ?longitude)
	    WHERE { ?Event_69 a dbo:Event .
	            ?Event_69 dbo:date ?date_89 .
	            ?Event_69 dbo:place ?place_92 .
	            ?place_92 n1:lat ?place_lat_158 .
	            ?place_92 n1:long ?place_long_159 . }
	    GROUP BY ?Event_69 ?date_89
	    ORDER BY ?date_89
	"""

	params = {
	    "query": query,
	    "format": "json"
	}

	logger.debug("Querying dbpedia events...")

	event_df = pd.DataFrame()

	# Sparql has 10k result limit so use loop w/ OFFSET param
	while True:
	    params["query"] = query + f"OFFSET {offset}"
	    resp = requests.get(SPARQL_URL, params=params)
	    
	    # Stop the loop if wrong status or no more results
	    if resp.status_code != 200 or len(resp.json()["results"]["bindings"]) == 0:
	        break
	        
	    # Parse JSON
	    chunk_df = pd.json_normalize(resp.json()["results"]["bindings"])
	    event_df = event_df.append(chunk_df, ignore_index=True)
	    logger.debug("Result size: {shape}\tAt offset: {offset}".format(shape=event_df.shape, offset=offset))
	    offset += 10000

	return event_df


def format_event_df(event_df):
	"""Reformats and cleans events dataframe to fit database schema"""

	# Rename columns
	event_df.rename(columns={
	    "event.value": "url",
	    "date.value": "date",
	    "latitude.value": "latitude",
	    "longitude.value": "longitude"
	}, inplace=True)

	# Parse event name
	event_df["name"] = event_df["url"].apply(lambda x: x.split("/")[-1].replace("_", " "))

	# Limit columns
	event_df = event_df[["url", "name", "date", "latitude", "longitude"]]

	logger.debug("Total size of events dataframe: {}".format(event_df.shape))

	return event_df


if __name__ == "__main__":
	logger.debug("Beginning refresh...")

	# timelinedb connection
	logger.debug("Connecting to timelinedb mysql database...")
	engine = create_engine("mysql://robert:{passwd}@{host}:{port}/{db}?charset=utf8".format(
		passwd=os.environ.get("MYSQL_PASSWORD", ""), 
		port=os.environ.get("MYSQL_PORT", 3306),
		host=os.environ.get("MYSQL_HOST_IP", "localhost"),
		db=os.environ.get("MYSQL_DATABASE"),
		))

	con = engine.connect()
	logger.debug("Connection established.")

	try:
		# Fetch events
		event_df = get_events()
		event_df = format_event_df(event_df)

		# Clear out existing mysql table
		logger.debug("Truncating timeline_event table...")
		con.execute("""DELETE FROM timeline_event""")
		logger.debug("timeline_event table truncated.")

		# Load dataframe to mysql table
		logger.debug("Loading new events to timeline_event table...")
		event_df.to_sql(name="timeline_event", con=con, if_exists="append", index=False)

	finally:
		con.close()

	logger.debug("Refresh completed.")
