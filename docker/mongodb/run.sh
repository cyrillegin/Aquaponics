#!/bin/bash
docker run -t -i -p 27017:27017 -v /data/db -d --name dragonfly_mongo mongo:3.4.3
