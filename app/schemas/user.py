# Pydantic Schemas


from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile_number: str
    password: str
    address: str

class LoginRequest(BaseModel):
    mobile_number: str
    password: str

class ResetPasswordRequest(BaseModel):
    phone: str
    newPassword: str

class Address(BaseModel):
    id: int 
    line1: str
    line2: Optional[str]
    city: str
    state: str
    pincode: str
    type: str 
    createdAt: datetime

class UserAddressUpdate(BaseModel):
    phone: str
    address: Address