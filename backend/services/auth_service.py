from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from core.security import create_access_token, get_password_hash, verify_password
from models.user import User
from schemas.auth import UserRegister


class AuthError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def register_user(db: Session, payload: UserRegister) -> User:
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise AuthError("Email already registered", status_code=409)

    user = User(
        name=payload.name,
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise AuthError("Email already registered", status_code=409) from exc

    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.query(User).filter(User.email == email.lower()).first()
    if user is None or not verify_password(password, user.hashed_password):
        raise AuthError("Incorrect email or password", status_code=401)

    if not user.is_active:
        raise AuthError("Account is inactive", status_code=403)

    return user


def create_user_token(user: User) -> str:
    return create_access_token(subject=user.id)
