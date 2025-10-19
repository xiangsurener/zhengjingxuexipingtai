from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from config import config


engine = create_engine(
    config.DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

Base = declarative_base()


def init_db():
    # Import models for metadata registration
    from models import User, LessonProgress, AssignmentScore  # noqa: F401

    Base.metadata.create_all(bind=engine)
