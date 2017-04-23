'''
Dragonfly
Cyrille Gindreau
2017

log.py
API endpoint for logs

GET
Returns an object with array of logs

POST
Adds a new log.
Params: A json object with keys 'title' and 'description'.

'''
import json
import cherrypy
import time

from sessionManager import sessionScope
from models import Log


class Logs:
    exposed = True

    def GET(self):
        cherrypy.response.headers['Content-Type'] = 'application/json'
        with sessionScope() as session:
            try:
                logs = session.query(Log)
                data = {"logs": []}
                for i in logs:
                    data['logs'].append(i.toDict())
            except Exception, e:
                data = {
                    "error": e,
                    "note": "No logs currently exist."
                }
            return json.dumps(data)

    def POST(self):
        print "POST request to log."
        cherrypy.response.headers['Content-Type'] = 'application/json'
        try:
            data = json.loads(cherrypy.request.body.read())
        except ValueError:
            data = {
                "error": "data could not be read."
            }

        if "title" not in data:
            data = {
                "error": "Must provide a title."
            }
        elif "description" not in data:
            data = {
                "error": "Must provide a description."
            }
        else:
            with sessionScope() as session:
                newLog = Log(created=time.time(), title=data['title'], description=data['description'])
                session.add(newLog)
                session.commit()
                print "Log added."
                data = newLog.toDict()
        return data
