from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class AdminOut(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: str = "admin"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: str
    admin: AdminOut


class MessageResponse(BaseModel):
    message: str
