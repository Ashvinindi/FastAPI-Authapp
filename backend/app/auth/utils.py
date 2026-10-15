from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str: # -> str indicates the return type of the function
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

