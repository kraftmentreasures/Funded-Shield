from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    app_name: str = "Funded-Shield API"
    debug: bool = True

    database_url: str = (
        "postgresql://postgres:Fundedshield123@localhost:5432/funded_shield"
    )

    jwt_secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    cors_origins: list[str] = ["http://localhost:3000"]

    admin_emails: list[str] = []


settings = Settings()
