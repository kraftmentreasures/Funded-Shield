import httpx


class TelegramError(Exception):
    pass


async def send_telegram_message(bot_token: str, chat_id: str, text: str) -> None:
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(url, json=payload)

    if response.status_code != 200:
        raise TelegramError(f"Telegram API error: {response.text}")

    data = response.json()
    if not data.get("ok"):
        raise TelegramError(data.get("description", "Unknown Telegram error"))


def send_telegram_message_sync(bot_token: str, chat_id: str, text: str) -> None:
    import asyncio

    asyncio.run(send_telegram_message(bot_token, chat_id, text))
