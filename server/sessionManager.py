# System Imports
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine.url import URL
# Global
from config import PGHOST, PGPORT, PGUSERNAME, PGPASSWORD, DBNAME

dboptions = {}
dboptions['drivername'] = 'postgres'
dboptions['host'] = PGHOST
dboptions['port'] = PGPORT
dboptions['username'] = PGUSERNAME
dboptions['password'] = PGPASSWORD
dboptions['database'] = DBNAME
engine = URL(**dboptions)


@contextmanager
def sessionScope():
    db = create_engine(engine)
    Session = sessionmaker(bind=db)
    session = Session()

    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def createSession():
    db = create_engine(engine)
    Session = sessionmaker(bind=db)
    session = Session()
    return session
