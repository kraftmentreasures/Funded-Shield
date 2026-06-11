import math


def normalize_pagination(
    page: int = 1,
    page_size: int = 20,
    *,
    max_page_size: int = 100,
) -> tuple[int, int, int]:
    """Return (page, page_size, offset)."""
    page = max(1, page)
    page_size = min(max(1, page_size), max_page_size)
    offset = (page - 1) * page_size
    return page, page_size, offset


def total_pages(total: int, page_size: int) -> int:
    if total == 0:
        return 0
    return math.ceil(total / page_size)
