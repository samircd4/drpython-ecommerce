import os
import uuid
import logging
import requests
from decimal import Decimal
from django.conf import settings

logger = logging.getLogger(__name__)


class SSLCommerzClient:
    """
    Handles payment session initiation and order validation with SSLCommerz.
    Supports both Sandbox and Production modes.
    """

    SANDBOX_GW_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
    LIVE_GW_URL = "https://securepay.sslcommerz.com/gwprocess/v4/api.php"

    SANDBOX_VALIDATION_URL = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
    LIVE_VALIDATION_URL = "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"

    def __init__(self, store_id=None, store_passwd=None, is_sandbox=None):
        self.store_id = store_id or getattr(settings, 'SSLCOMMERZ_STORE_ID', '')
        self.store_passwd = store_passwd or getattr(settings, 'SSLCOMMERZ_STORE_PASSWD', '')
        
        if is_sandbox is not None:
            self.is_sandbox = is_sandbox
        else:
            self.is_sandbox = getattr(settings, 'SSLCOMMERZ_IS_SANDBOX', True)

        self.session_url = self.SANDBOX_GW_URL if self.is_sandbox else self.LIVE_GW_URL
        self.validation_url = self.SANDBOX_VALIDATION_URL if self.is_sandbox else self.LIVE_VALIDATION_URL

    def initiate_payment(self, order, request=None):
        """
        Creates a payment session on SSLCommerz for the given order.
        Returns a dict: {"success": bool, "payment_url": str, "tran_id": str, "message": str}
        """
        if not self.store_id or not self.store_passwd:
            error_msg = "SSLCommerz store_id or store_passwd is not configured."
            logger.error(error_msg)
            return {"success": False, "message": error_msg}

        # Determine backend base URL for callbacks
        backend_base = getattr(settings, 'BACKEND_URL', '').rstrip('/')
        if not backend_base and request:
            backend_base = request.build_absolute_uri('/')[:-1]
        if not backend_base:
            backend_base = "http://localhost:8000"

        # Unique transaction ID
        tran_id = f"ORD{order.id}-{uuid.uuid4().hex[:8].upper()}"

        success_url = f"{backend_base}/payment/sslcommerz/success/"
        fail_url = f"{backend_base}/payment/sslcommerz/fail/"
        cancel_url = f"{backend_base}/payment/sslcommerz/cancel/"
        ipn_url = f"{backend_base}/payment/sslcommerz/ipn/"

        # Customer details
        cus_name = (order.full_name or (order.customer.name if order.customer else "")).strip() or "Valued Customer"
        cus_email = (order.email or (order.customer.email if order.customer else "")).strip() or "customer@gurudebenterprise.com"
        cus_phone = (order.phone or "").strip() or "01700000000"
        cus_add1 = (order.shipping_address or "").strip() or "Dhaka"
        cus_city = (order.district or "").strip() or "Dhaka"
        cus_postcode = "1000"
        cus_country = "Bangladesh"

        total_amount = float(order.grand_total)

        payload = {
            "store_id": self.store_id,
            "store_passwd": self.store_passwd,
            "total_amount": f"{total_amount:.2f}",
            "currency": "BDT",
            "tran_id": tran_id,
            "success_url": success_url,
            "fail_url": fail_url,
            "cancel_url": cancel_url,
            "ipn_url": ipn_url,
            # Customer Info
            "cus_name": cus_name,
            "cus_email": cus_email,
            "cus_add1": cus_add1,
            "cus_city": cus_city,
            "cus_state": order.division or "Dhaka",
            "cus_postcode": cus_postcode,
            "cus_country": cus_country,
            "cus_phone": cus_phone,
            # Shipment Info
            "shipping_method": "YES",
            "num_of_item": order.items.count() if hasattr(order, 'items') and order.items.exists() else 1,
            "ship_name": cus_name,
            "ship_add1": cus_add1,
            "ship_city": cus_city,
            "ship_country": cus_country,
            "ship_postcode": cus_postcode,
            # Product Info
            "product_name": f"Order #{order.id}",
            "product_category": "General",
            "product_profile": "general",
            # Additional values to pass through
            "value_a": str(order.id),
        }

        try:
            logger.info(f"Initiating SSLCommerz payment for Order #{order.id}, tran_id: {tran_id}")
            response = requests.post(self.session_url, data=payload, timeout=20)
            data = response.json()

            if data.get("status") == "SUCCESS":
                gateway_url = data.get("GatewayPageURL") or data.get("redirectGatewayURL")
                
                # Update PaymentInfo transaction_id
                if order.payment_info:
                    order.payment_info.transaction_id = tran_id
                    order.payment_info.payment_method = 'sslcommerz'
                    order.payment_info.save(update_fields=['transaction_id', 'payment_method'])

                return {
                    "success": True,
                    "payment_url": gateway_url,
                    "tran_id": tran_id,
                    "session_key": data.get("sessionkey"),
                }
            else:
                failed_reason = data.get("failedreason") or "Failed to initiate payment."
                logger.error(f"SSLCommerz initiation failed for Order #{order.id}: {failed_reason}")
                return {
                    "success": False,
                    "message": failed_reason,
                }
        except requests.exceptions.RequestException as e:
            logger.exception(f"SSLCommerz connection error for Order #{order.id}: {str(e)}")
            return {
                "success": False,
                "message": f"Could not connect to payment gateway: {str(e)}",
            }

    def validate_payment(self, val_id):
        """
        Validates the transaction with SSLCommerz Order Validation API.
        Returns the parsed response dict if VALID/VALIDATED, else None.
        """
        if not val_id:
            logger.error("No val_id provided for SSLCommerz validation.")
            return None

        params = {
            "val_id": val_id,
            "store_id": self.store_id,
            "store_passwd": self.store_passwd,
            "format": "json",
            "v": "1",
        }

        try:
            logger.info(f"Validating SSLCommerz transaction val_id: {val_id}")
            response = requests.get(self.validation_url, params=params, timeout=20)
            data = response.json()

            status = data.get("status")
            if status in ["VALID", "VALIDATED"]:
                return data
            else:
                logger.warning(f"SSLCommerz validation returned non-valid status: {status} ({data.get('error')})")
                return None
        except Exception as e:
            logger.exception(f"SSLCommerz validation request failed for val_id {val_id}: {str(e)}")
            return None
