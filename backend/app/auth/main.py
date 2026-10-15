from ast import Dict
from typing import Dict
from fastapi import APIRouter, Depends, FastAPI, status, HTTPException
from sqlalchemy.orm import Session
#from app.auth import models, auth_database, schemas, utils
from app.database import get_db
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from app.auth import models, schemas, utils

SECRET_KEY = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Instantiate OAuth2PasswordBearer scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login") 


#helper function that takes user data
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encode_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encode_jwt

app = FastAPI()

@app.post("/signup", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)

def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if the username or email already exists in the database
    existing_user = db.query(models.User).filter(
        models.User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already exists")

    #hash the password before storing it in the database
    hashed_password = utils.hash_password(user.password)

    #create a new user instance
    new_user = models.User(
        username = user.username,
        email = user.email,
        hashed_password = hashed_password, 
        role = user.role
    )

    #Save user to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)


    return new_user

@app.post("/login", response_model=schemas.Token)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)):

    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    if not utils.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": user}


def get_current_user(token: str = Depends(oauth2_scheme)):
    credential_exception = HTTPException(status_code = status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})


    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None or role is None:
            raise credential_exception

    except JWTError:
        raise credential_exception

    return {"username": username, "role": role}

@app.get("/protected")
def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello, {current_user['username']} | you accessed a protected route"}


def require_role(required_roles: str | list[str]):
    if isinstance(required_roles, str):
        required_roles = [required_roles]

    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["role"] not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource",
            )
        return current_user

    return role_checker

@app.get("/profile")
def profile(current_user: Dict = Depends(require_role(["user", "admin"]))):
    return {"message": f"Hello, {current_user['username']} | this is your profile"}

@app.get("/user/dashboard")
def user_dashboard(current_user: Dict = Depends(require_role("user"))):
    return {"message": "Welcome to the user dashboard!"}

@app.get("/admin/dashboard")
def admin_dashboard(current_user: Dict = Depends(require_role("admin"))):
    return {"message": "Welcome to the admin dashboard!"}