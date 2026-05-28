from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from database import Base

class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    definition = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
