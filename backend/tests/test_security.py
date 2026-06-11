from core.security import get_password_hash, verify_password


def test_password_hash_and_verify():
    password = "securepass123"
    hashed = get_password_hash(password)

    assert hashed != password
    assert hashed.startswith("pbkdf2:sha256:")
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_long_password_supported():
    password = "a" * 100
    hashed = get_password_hash(password)
    assert verify_password(password, hashed) is True
