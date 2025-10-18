from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, UniqueConstraint, Text
from sqlalchemy.orm import relationship
from db import Base
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(120), nullable=False)
    password_hash = Column(String(255), nullable=False)


    
    created_at = Column(DateTime, default=datetime.utcnow)
    progresses = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")
    assignment_scores = relationship("AssignmentScore", back_populates="user", cascade="all, delete-orphan")
    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "displayName": self.display_name,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }
class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="uq_progress_user_lesson"),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(String(64), nullable=False)
    current_index = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", back_populates="progresses")
    def to_dict(self):
        return {
            "lessonId": self.lesson_id,
            "currentIndex": self.current_index,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
class AssignmentScore(Base):
    __tablename__ = "assignment_scores"
    __table_args__ = (UniqueConstraint("user_id", "assignment_id", name="uq_assignment_user"),)
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assignment_id = Column(String(64), nullable=False)
    score_run = Column(Integer, default=0)
    score_compliance = Column(Integer, default=0)
    score_effect = Column(Integer, default=0)
    total_score = Column(Integer, default=0)
    raw_result = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="assignment_scores")

    def to_dict(self):
        return {
            "assignmentId": self.assignment_id,
            "totalScore": self.total_score,
            "runScore": self.score_run,
            "complianceScore": self.score_compliance,
            "effectScore": self.score_effect,
            "updatedAt": self.updated_at.isoformat() if self.updated_at else None,
        }
