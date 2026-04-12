from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    id: int
    email: str
    is_admin: bool
    access_token: str
    token_type: str = "bearer"
    message: str = "Login successful"