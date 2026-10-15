from pydantic import BaseModel, EmailStr

#schema for new user creation
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "user"  # Default role is "user"

#schema for user login
class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    
