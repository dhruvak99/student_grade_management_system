from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="dhruva.0107@gmail.com",
    MAIL_PASSWORD="qljkmdjtwxygvnlo",
    MAIL_FROM="dhruva.0107@gmail.com",
    MAIL_SERVER="smtp.gmail.com",
    MAIL_PORT=587,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)


async def send_export_mail(to_email: str, sheet_link: str):
    message = MessageSchema(
        subject="Student Grades Export",
        recipients=[to_email],
        body=f"""
Hello,

The student grades have been successfully exported.

Google Sheet Link:
{sheet_link}

Regards,
Student Grade Management System
""",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)