from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic.alias_generators import to_camel

from app.models.user import UserRole


class OtpRequest(BaseModel):
    """Request body for ``POST /api/v1/auth/send-otp``."""

    email: EmailStr


class OtpVerify(BaseModel):
    """Request body for ``POST /api/v1/auth/verify-otp``."""

    email: EmailStr
    otp: str = Field(min_length=4, max_length=10)


class TokenResponse(BaseModel):
    """JWT token pair returned after successful authentication."""

    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """Public user profile returned to frontend."""

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel,
    )

    id: int
    email: str
    full_name: str
    department: str
    role: UserRole
