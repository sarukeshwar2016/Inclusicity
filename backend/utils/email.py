import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app


def send_helper_verified_email(to_email, helper_name):
    subject = "InclusiCity – Helper Account Verified ✅"

    body = f"""
Hello {helper_name},

🎉 Congratulations!

Your helper account on InclusiCity has been verified by our team.

You can now log in and start accepting requests.

Login here:
http://localhost:5173/login

Thank you for supporting an inclusive city ❤️

– InclusiCity Team
"""

    msg = MIMEMultipart()
    msg["From"] = current_app.config["MAIL_USERNAME"]
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        server = smtplib.SMTP(
            current_app.config["MAIL_SERVER"],
            current_app.config["MAIL_PORT"]
        )
        server.starttls()
        server.login(
            current_app.config["MAIL_USERNAME"],
            current_app.config["MAIL_PASSWORD"]
        )
        server.send_message(msg)
        server.quit()

        print("✅ Email sent to:", to_email)
        return True

    except Exception as e:
        print("❌ Email send failed:", e)
        return False
