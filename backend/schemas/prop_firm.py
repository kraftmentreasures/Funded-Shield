from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class RuleTypeEnum(str, Enum):
    PERCENTAGE = "percentage"
    AMOUNT = "amount"
    BOOLEAN = "boolean"
    DURATION = "duration"
    TEXT = "text"


class PropFirmBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    website: str | None = Field(None, max_length=255)
    logo_url: str | None = Field(None, max_length=500)
    is_active: bool = True

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Name cannot be empty")
        return stripped


class PropFirmCreate(PropFirmBase):
    pass


class PropFirmUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    website: str | None = Field(None, max_length=255)
    logo_url: str | None = Field(None, max_length=500)
    is_active: bool | None = None


class PropFirmResponse(BaseModel):
    id: str
    name: str
    website: str | None
    logo_url: str | None
    is_active: bool
    created_at: datetime
    rule_count: int = 0

    model_config = {"from_attributes": True}

    @field_validator("id", mode="before")
    @classmethod
    def serialize_uuid(cls, value: object) -> str:
        return str(value)


class PropFirmDetailResponse(PropFirmResponse):
    rules: list["PropFirmRuleResponse"] = []


class PropFirmRuleBase(BaseModel):
    rule_name: str = Field(..., min_length=1, max_length=150)
    rule_value: str = Field(..., min_length=1, max_length=255)
    rule_type: RuleTypeEnum
    source_url: str | None = Field(None, max_length=500)
    verified: bool = False

    @field_validator("rule_name", "rule_value")
    @classmethod
    def strip_strings(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Field cannot be empty")
        return stripped


class PropFirmRuleCreate(PropFirmRuleBase):
    pass


class PropFirmRuleUpdate(BaseModel):
    rule_name: str | None = Field(None, min_length=1, max_length=150)
    rule_value: str | None = Field(None, min_length=1, max_length=255)
    rule_type: RuleTypeEnum | None = None
    source_url: str | None = Field(None, max_length=500)
    verified: bool | None = None


class PropFirmRuleResponse(BaseModel):
    id: str
    prop_firm_id: str
    rule_name: str
    rule_value: str
    rule_type: RuleTypeEnum
    source_url: str | None
    verified: bool
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_validator("id", "prop_firm_id", mode="before")
    @classmethod
    def serialize_uuid(cls, value: object) -> str:
        return str(value)


class PaginatedMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class PropFirmListResponse(BaseModel):
    firms: list[PropFirmResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


class PropFirmRuleWithFirmResponse(PropFirmRuleResponse):
    prop_firm_name: str


class RuleListResponse(BaseModel):
    rules: list[PropFirmRuleWithFirmResponse]
    page: int
    page_size: int
    total: int
    total_pages: int


PropFirmDetailResponse.model_rebuild()
