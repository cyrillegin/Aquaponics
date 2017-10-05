#!/usr/bin/env python
import cherrypy
import os
import sys
import jinja2
from sqlalchemy import create_engine

import models
from api import ResourceApi
from commands import Command

PATH = os.path.abspath(os.path.dirname(__file__))
STATIC = os.path.join(PATH, '../static')
sys.path.append(PATH)

env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(searchpath=os.path.join(PATH, '../static/')), )


def get_cp_config():
    config = {
        '/': {
            'tools.staticdir.on': True,
            'tools.staticdir.dir': STATIC,
            'tools.sessions.on': True
        },
        '/api': {
            'request.dispatch': cherrypy.dispatch.MethodDispatcher()
        },
    }
    return config


def CheckBackups():
    latestBackup = 0
    for filename in os.listdir(os.path.join(PATH, "..", "dbBackups")):
        if os.path.getmtime(os.path.join(PATH, "..", "dbBackups", filename)) > latestBackup:
            latestBackup = os.path.getmtime(os.path.join(PATH, "..", "dbBackups", filename))
    return latestBackup


class Root(object):
    api = ResourceApi()

    def index(self):
        lastBackup = CheckBackups()
        context = {
            "lastBackup": lastBackup
        }
        t = env.get_template("index.html")
        return t.render(context)
    index.exposed = True


def RunServer():

    open('../dragonDB.db', 'a').close()
    print "db opened."
    dbURL = 'sqlite:///dragonDB.db'

    db = create_engine(dbURL)

    print "Initializing database tables..."
    models.Base.metadata.create_all(db)

    cherrypy.tree.mount(Root(), '/', config=get_cp_config())
    cherrypy.server.socket_host = "0.0.0.0"
    cherrypy.server.socket_port = int(os.environ.get('PORT', 5000))
    cherrypy.engine.start()
    cherrypy.engine.block()


if __name__ == "__main__":
    args = sys.argv
    if len(args) > 1:
        arg = "{}".format(args[1]).lower()
        if(arg == "run"):
            print "starting server!"
            RunServer()
        elif(arg == "loadfixtures"):
            print "loading fixtures"
            Command.LoadFixtures()
        elif(arg == "serialpoller"):
            print "starting poller"
            Command.SerialPoller()
        elif arg == "weathersensor":
            print "getting weather data"
            Command.WeatherSensor()
        elif arg == "cleanreadings":
            print "cleaning readings"
        elif arg == "fishcam":
            print "Starting Fish Cam."
            Command.FishCam()
        elif arg == "gpiopoller":
            print "reading from gpio"
            Command.GpioPoller()
        elif arg == "pressurepoller":
            print "reading from pressure poller"
            Command.PressurePoller()
        elif arg == "wiresensor":
            print "reading from one wire sensor."
            Command.OneWirePoller()
        else:
            print 'Did not understand the command, please try again.'
    else:
        print"Could not understand arguements, use one from the following list:"
        print "\n\nServer:"
        print "run - Starts the server."
        print "\nData:"
        print "loadFixtures - Loads some sample data into the database via the api."
        print "weatherSensor - Requests data from lascruce-weather.org to get temperature."
        print "fishCam - Takes a picture every 5 mintues."
        print "\nPollers:"
        print "serialPoller - Start polling for USB devices to get data from."
        print "gpioPoller - Start polling for raspberry pi gpio pins to get data from."
        print "pressurePoller - Start polling the pressure sensor."
        print "wiresensor - Poll from a One Wire sensor."