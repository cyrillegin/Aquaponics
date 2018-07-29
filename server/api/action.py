import json
import cherrypy
import logging
import time
from sessionManager import sessionScope
from models import Action
from api.short_uuid import short_uuid

logging.basicConfig(format='%(levelname)s:%(asctime)s %(message)s', level=logging.INFO)


class Actions:
    exposed = True

    def GET(self, **kwargs):
        logging.info('GET request to actions.')

        cherrypy.response.headers['Content-Type'] = 'application/json'

        with sessionScope() as session:
            data = session.query(Action)
            if 'sensor' in kwargs:
                data = data.filter_by(sensor=kwargs['sensor'])
            payload = []
            for i in data:
                payload.append(i.toDict())
            return json.dumps(payload).encode('utf-8')

    def POST(self):
        # Save in database
        logging.info('POST request to actions')

        try:
            data = json.loads(cherrypy.request.body.read().decode('utf-8'))
        except ValueError:
            logging.error('Json data could not be read.')
            return json.dumps({"error": "Data could not be read."}).encode('utf-8')

        print (data)
        if 'sensor' not in data:
            logging.info('error: no sensor information in data')
            return json.dumps({'error': 'No sensor information in data.'}).encode('utf-8')

        if 'plugin' not in data:
            logging.info('Error: No plugin information given.')
            return json.dumps({'Error': 'No plugin information in data.'}).encode('utf-8')

        if 'operator' not in data:
            logging.info('Error: No operator information given.')
            return json.dumps({'Error': 'No operator information in data.'}).encode('utf-8')

        if 'value' not in data:
            logging.info('Error: No value information given.')
            return json.dumps({'Error': 'No value information in data.'}).encode('utf-8')

        with sessionScope() as session:
            action = createAction(session, data)
            payload = {
                'action': action
            }
        return json.dumps(payload).encode('utf-8')

    def PUT(self):
        logging.info('PUT request to actions.')

        try:
            data = json.loads(cherrypy.request.body.read().decode('utf-8'))
        except ValueError:
            logging.error('Json data could not be read.')
            return json.dumps({"error": "Data could not be read."}).encode('utf-8')
        if 'uuid' not in data:
            logging.error('No action ID found.')
            return json.dumps({"Error": "Action id not provided."}).encode('utf-8')
        with sessionScope() as session:
            try:
                action = session.query(Action).filter_by(uuid=data['uuid']).one()
                logging.info('Action found.')
                payload = {
                    "action": updateAction(session, action, data)
                }
            except Exception as e:
                logging.error('Error updating action.')
                logging.error(e)
                return json.dumps({'Error': 'Error updating action.'}).encode('utf-8')
        payload = {}
        return json.dumps(payload).encode('utf-8')

    def DELETE(self, *args, **kwargs):
        logging.info('DELETE request to sensors')

        if 'action' not in kwargs:
            logging.error("No acion given")
            return json.dumps({'error': 'No action given.'}).encode('utf-8')
        with sessionScope() as session:
            action = session.query(Action).filter_by(uuid=kwargs['action']).one()
            logging.info('Deleting action')
            session.delete(action)
            session.commit()
            logging.info('Delete successful')
            return json.dumps({'success': 'delete successful.'}).encode('utf-8')


def updateAction(session, DbAction, data):
    updates = False
    for i in data:
        if i not in ['uuid', 'sensor', 'created', 'modified'] and data[i] != DbAction.toDict()[i]:
            if data[i] == '':
                data[i] = None
            updates = True
            setattr(DbAction, i, data[i])
    if updates:
        try:
            setattr(DbAction, 'modified', time.time() * 1000)
            logging.info('Action has changed, updating.')
            session.add(DbAction)
            session.commit()
        except Exception as e:
            logging.error('Unknown Field found')
            logging.error(e)
            return {'error': 'Unknown field'}
    return session.query(Action).filter_by(uuid=data['uuid']).one().toDict()


def createAction(session, data):
    # Required Fields
    action = {
        'uuid': short_uuid(),
        "created": time.time() * 1000,
        "modified": time.time() * 1000,
        'sensor': data['sensor'],
        'plugin': data['plugin'],
        'operator': data['operator'],
        'value': data['value'],
        'status': 'on'
    }

    # Fields with defaults
    if 'notificationRate' in data:
        action['notification_rate'] = data['notificationRate']
    else:
        action['notification_rate'] = 15 * 60

    # Optional fields.
    if 'meta' in data:
        action['meta'] = data['meta']

    newAction = Action(**action)

    session.add(newAction)
    session.commit()
    return session.query(Action).filter_by(uuid=action['uuid']).one().toDict()