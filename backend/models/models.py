from datetime import datetime
from enum import Enum
from typing import Any, Optional
from beanie import Document, Indexed
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class UserRole(str, Enum):
    PROOFREADER = "proofreader"
    ADMIN = "admin"


class ProofingApplicationStatus(str, Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    COMPLETED = "completed"


class FormStatus(str, Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"


class LabelType(str, Enum):
    BASE = "base"
    CHILD = "child"


class ValidationOutcome(str, Enum):
    PASS = "pass"
    FAIL = "fail"
    PARTIAL = "partial"
    NOT_APPLICABLE = "not_applicable"


class AuditAction(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class DiffType(str, Enum):
    ADDED = "added"
    REMOVED = "removed"
    MODIFIED = "modified"
    REPOSITIONED = "repositioned"


# ---------------------------------------------------------------------------
# Collections
# ---------------------------------------------------------------------------

class User(Document):
    fullName: str
    email: Indexed(EmailStr, unique=True)
    role: UserRole
    isActive: bool = True
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"


class ProofingApplication(Document):
    title: str
    description: Optional[str] = None
    status: ProofingApplicationStatus = ProofingApplicationStatus.DRAFT
    formStatus: FormStatus = FormStatus.PENDING
    createdBy: ObjectId
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "proofingApplications"
        indexes = ["createdBy", "status"]


class Label(Document):
    proofingApplicationId: Indexed(ObjectId)
    labelType: LabelType
    fileUrl: str
    fileName: str
    version: str
    uploadedBy: ObjectId
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "labels"
        indexes = ["proofingApplicationId", "labelType"]


class ProofingRequestAttribute(Document):
    proofingApplicationId: Indexed(ObjectId)
    attributeKey: str
    attributeValue: dict[str, Any]
    displayOrder: int
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "proofingRequestAttributes"
        indexes = ["proofingApplicationId"]


class ValidationResult(Document):
    attributeId: Indexed(ObjectId)
    reviewedBy: Optional[ObjectId] = None      # user who confirmed the outcome
    systemFlag: Optional[str] = None           # what the comparison app detected
    outcome: Optional[ValidationOutcome] = None
    remarks: Optional[str] = None
    reviewedAt: Optional[datetime] = None
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "validationResults"
        indexes = ["attributeId", "reviewedBy"]


class ComparisonDiff(Document):
    proofingApplicationId: Indexed(ObjectId)   # which application this diff belongs to
    attributeId: Optional[ObjectId] = None     # linked ProofingRequestAttribute if matched
    baseLabelId: ObjectId                      # the base label used in this comparison
    childLabelId: ObjectId                     # the child label used in this comparison
    diffType: DiffType                         # added / removed / modified
    rawTextBase: Optional[str] = None          # extracted text from base label
    rawTextChild: Optional[str] = None         # extracted text from child label
    description: Optional[str] = None         # human-readable summary of the diff
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "comparisonDiffs"
        indexes = ["proofingApplicationId", "attributeId", "diffType"]


class AuditLog(Document):
    actorId: ObjectId                          # user who triggered the action
    collectionName: str                        # e.g. "applications", "validationResults"
    documentId: ObjectId                       # _id of the affected document
    action: AuditAction
    beforeState: Optional[dict[str, Any]] = None
    afterState: Optional[dict[str, Any]] = None
    ipAddress: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "auditLogs"
        indexes = ["actorId", "collectionName", "documentId", "createdAt"]


# ---------------------------------------------------------------------------
# Helper — write an audit log entry
# ---------------------------------------------------------------------------

async def write_audit_log(
    actor_id: ObjectId,
    collection_name: str,
    document_id: ObjectId,
    action: AuditAction,
    before: Optional[dict] = None,
    after: Optional[dict] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    log = AuditLog(
        actorId=actor_id,
        collectionName=collection_name,
        documentId=document_id,
        action=action,
        beforeState=before,
        afterState=after,
        ipAddress=ip_address,
    )
    await log.insert()
    return log

# ---------------------------------------------------------------------------
# Beanie init — register all document models on startup
# ---------------------------------------------------------------------------
# await init_beanie(
#     database=db,
#     document_models=[
#         User, ProofingApplication, Label,
#         ProofingRequestAttribute, ValidationResult,
#         ComparisonDiff, AuditLog
#     ]
# )