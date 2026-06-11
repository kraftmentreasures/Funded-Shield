from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from werkzeug.security import check_password_hash, generate_password_hash

from core.config import settings

# pbkdf2:sha256 — no 72-byte limit, works on Python 3.14 without bcrypt/passlib
_PASSWORD_HASH_METHOD = "pbkdf2:sha256"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return check_password_hash(hashed_password, plain_password)


def get_password_hash(password: str) -> str:
    return generate_password_hash(password, method=_PASSWORD_HASH_METHOD)


def create_access_token(
    subject: str | Any,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(UTC) + (
        expires_delta
        if expires_delta
        else timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        return None
