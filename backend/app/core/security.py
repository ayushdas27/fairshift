import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt

try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerifyMismatchError
    _hasher = PasswordHasher()
    def hash_password(password: str) -> str:
        return _hasher.hash(password)

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            return _hasher.verify(hashed_password, plain_password)
        except VerifyMismatchError:
            return False
        except Exception:
            return False
except ImportError:
    # Fallback to PBKDF2-HMAC-SHA256 if argon2 is not loaded
    def hash_password(password: str) -> str:
        salt = secrets.token_hex(16)
        h = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
        return f"pbkdf2:{salt}:{h}"

    def verify_password(plain_password: str, hashed_password: str) -> bool:
        try:
            parts = hashed_password.split(":")
            if len(parts) != 3 or parts[0] != "pbkdf2":
                return False
            salt = parts[1]
            stored_hash = parts[2]
            computed = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()
            return secrets.compare_digest(stored_hash, computed)
        except Exception:
            return False

from backend.app.core.config import settings

def create_access_token(subject: str | Any, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None

def hash_tracking_secret(secret_str: str) -> str:
    """Hash high-entropy grievance tracking secret for safe verification without plaintext persistence."""
    return hashlib.sha256((secret_str + settings.SECRET_KEY).encode('utf-8')).hexdigest()

def verify_tracking_secret(secret_str: str, hashed_secret: str) -> bool:
    candidate = hash_tracking_secret(secret_str)
    return secrets.compare_digest(candidate, hashed_secret)
