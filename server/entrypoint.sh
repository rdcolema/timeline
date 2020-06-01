#!/bin/sh

TIMEOUT=180

wait_for() {
  for i in `seq $TIMEOUT` ; do
    nc -z mysql 3306 > /dev/null 2>&1
    
    result=$?
    if [ $result -eq 0 ] ; then
      exec "python3 refresh_events.py"
      echo "Events refreshed." >&2
      return 0
    fi
  done
  echo "WARNING: Database connection timed out, could not refresh events." >&2
  exit 1
}


wait_for
npm start
