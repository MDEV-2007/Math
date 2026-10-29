import asyncio
import logging

from django.conf import settings
from django.core.management.base import BaseCommand
from rest_framework.authtoken.models import Token
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import Application, CallbackQueryHandler, CommandHandler, ContextTypes

from accounts.models import TelegramLoginSession, User

logger = logging.getLogger(__name__)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    args = context.args
    session_id = args[0] if args else None

    if not session_id:
        await update.message.reply_text(
            "Bu bot ILM Math ilovasiga kirish uchun ishlatiladi.\n"
            "Ilovadan 'Telegram orqali kirish' tugmasini bosing."
        )
        return

    session = await TelegramLoginSession.objects.filter(session_id=session_id).afirst()
    if session is None:
        await update.message.reply_text("Login havolasi yaroqsiz. Ilovadan qaytadan urinib ko'ring.")
        return

    keyboard = [[InlineKeyboardButton("Tasdiqlash", callback_data=f"confirm_login:{session_id}")]]
    await update.message.reply_text(
        "ILM Math ilovasiga kirishni tasdiqlaysizmi?\n\n"
        f"Ism: {update.effective_user.first_name}\n"
        f"Username: @{update.effective_user.username or '-'}",
        reply_markup=InlineKeyboardMarkup(keyboard),
    )


async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()

    if not query.data.startswith("confirm_login:"):
        return

    session_id = query.data.split(":", 1)[1]
    tg_user = query.from_user

    session = await TelegramLoginSession.objects.filter(session_id=session_id).afirst()
    if session is None:
        await query.edit_message_text("Havola muddati o'tgan. Ilovadan qaytadan urinib ko'ring.")
        return

    user, _ = await User.objects.aget_or_create(
        telegram_id=tg_user.id,
        defaults={
            'username': tg_user.username or f"tg_{tg_user.id}",
            'first_name': tg_user.first_name or '',
            'telegram_username': tg_user.username,
            'is_verified': True,
            'role': 'student',
        },
    )

    token, _ = await Token.objects.aget_or_create(user=user)

    session.confirmed = True
    session.telegram_id = tg_user.id
    session.telegram_username = tg_user.username
    session.first_name = tg_user.first_name
    session.token = token.key
    await session.asave()

    await query.edit_message_text("Kirish tasdiqlandi! Ilovaga qaytishingiz mumkin.")


class Command(BaseCommand):
    help = "Run the ILM Math Telegram login bot (long polling, no public webhook needed)"

    def handle(self, *args, **options):
        if not settings.TELEGRAM_BOT_TOKEN:
            self.stderr.write("TELEGRAM_BOT_TOKEN is not set in .env")
            return

        # Python 3.14 no longer auto-creates an event loop for the main
        # thread; python-telegram-bot's run_polling() still expects one.
        try:
            asyncio.get_event_loop()
        except RuntimeError:
            asyncio.set_event_loop(asyncio.new_event_loop())

        application = Application.builder().token(settings.TELEGRAM_BOT_TOKEN).build()
        application.add_handler(CommandHandler("start", start_command))
        application.add_handler(CallbackQueryHandler(button_callback))

        self.stdout.write(self.style.SUCCESS("Telegram bot polling started..."))
        application.run_polling()
