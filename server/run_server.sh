#!/bin/sh

TIMEOUT=180

wait_for_db() {
  for i in `seq $TIMEOUT` ; do
    nc -z mysql 3306 > /dev/null 2>&1
    result=$?
    if [ $result -eq 0 ] ; then
      echo "Database available." >&2
      return 0
    fi
    sleep 1
  done
  echo "WARNING: Database connection timed out, could not refresh events." >&2
}

wait_for_db
python3 refresh_events.py
npm start
