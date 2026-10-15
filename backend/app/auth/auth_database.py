from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base


MYSQL_USER = "root"
MYSQL_PASSWORD = ""
MYSQL_HOST = "localhost"
MYSQL_PORT = "3306"
MYSQL_DATABASE = "fastapi_db"

DATABASE_URL = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}"

engine = create_engine(DATABASE_URL)

sessionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

def get_db():
    db = sessionLocal()
    try: 
        yield db
    finally:
        db.close()


Base = declarative_base()