import logging
from anymail.message import AnymailMessage
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

logger = logging.getLogger(__name__)


def send_template_email(
    subject,
    template_name,
    context,
    recipient_list,
    attachments=None,
    tags=None,
    metadata=None,
):
    """
    Standard function to send template-based emails via Brevo (Anymail).
    Returns True on success, False on failure.
    """
    try:
        html_content = render_to_string(f'emails/{template_name}', context)
        text_content = strip_tags(html_content)

        email = AnymailMessage(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list,
        )
        email.attach_alternative(html_content, "text/html")

        if attachments:
            for filename, content, mimetype in attachments:
                email.attach(filename, content, mimetype)

        if tags:
            email.tags = tags

        if metadata:
            email.metadata = metadata

        email.send(fail_silently=False)

        logger.info(
            "Email sent successfully",
            extra={
                "subject": subject,
                "recipients": recipient_list,
                "template": template_name,
                "tags": tags,
            },
        )
        return True

    except Exception as e:
        logger.error(
            "Failed to send email",
            exc_info=True,
            extra={
                "subject": subject,
                "recipients": recipient_list,
                "template": template_name,
                "error": str(e),
            },
        )
        return False


def send_order_email(order, template_name, subject):
    """
    Base function to send order-related emails via Brevo.
    Returns True on success, False on failure.
    """
    # Safely extract recipient email
    recipient_email = None
    if order.email:
        recipient_email = order.email
    elif order.customer and order.customer.user:
        recipient_email = order.customer.user.email

    if not recipient_email:
        logger.warning(
            "No email address found for order, skipping email send.",
            extra={"order_id": order.id},
        )
        return False

    frontend_url = settings.FRONTEND_URL
    logo_url = "https://sarker.shop/static/images/logo.png"

    context = {
        'order': order,
        'full_name': order.full_name or (order.customer.name if order.customer else 'Valued Customer'),
        'items': order.items.all(),
        'total_amount': order.total_amount,
        'tracking_url': f"{frontend_url}/order-tracking/{order.id}",
        'feedback_url': f"{frontend_url}/reviews/{order.id}",
        'frontend_url': frontend_url,
        'logo_url': logo_url,
    }

    attachments = []
    try:
        from utils.pdf import generate_invoice_pdf
        pdf_content = generate_invoice_pdf(order)
        if pdf_content:
            attachments.append((f"invoice_{order.id}.pdf", pdf_content, "application/pdf"))
    except Exception as e:
        logger.warning(
            "Error generating invoice PDF, continuing without attachment.",
            extra={"order_id": order.id, "error": str(e)},
        )

    return send_template_email(
        subject=subject,
        template_name=template_name,
        context=context,
        recipient_list=[recipient_email],
        attachments=attachments or None,
        tags=["order"],
        metadata={"order_id": str(order.id)},
    )


def send_order_placed_email(order):
    subject = f"Order Placed Successfully - #{order.id} | Sarker Shop"
    return send_order_email(order, 'order_placed_email.html', subject)


def send_order_status_update_email(order):
    status_name = order.order_status.display_name if order.order_status else "Updated"
    subject = f"Order #{order.id} Status Update: {status_name} | Sarker Shop"
    return send_order_email(order, 'order_status_update_email.html', subject)


def send_feedback_request_email(order):
    subject = f"We'd love your feedback! Order #{order.id} | Sarker Shop"
    return send_order_email(order, 'order_feedback_email.html', subject)
