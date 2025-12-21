from celery_app import celery_app
from utils.email import send_helper_verified_email
from app import app  # 🔥 import Flask app


@celery_app.task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3, "countdown": 10},
)
def send_helper_verified_email_task(self, to_email, helper_name):
    # 🔥 PUSH FLASK APP CONTEXT
    with app.app_context():
        return send_helper_verified_email(
            to_email=to_email,
            helper_name=helper_name,
        )
