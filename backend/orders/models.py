from django.db import models
from django.conf import settings
from decimal import Decimal
from accounts.models import Customer, Address
from products.models import Product, ProductVariant

# 1. Order Status Model


class OrderStatus(models.Model):
    """
    Tracks lifecycle states: Pending, Confirmed, Shipped, Delivered, Cancelled.
    """
    status_code = models.CharField(
        max_length=20, unique=True)  # e.g., 'pending'
    display_name = models.CharField(max_length=50)  # e.g., 'Pending'
    description = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return str(self.display_name)


# 2. Coupon Model

class Coupon(models.Model):
    """
    Model for discount coupons.
    """
    DISCOUNT_CHOICES = (
        ('percentage', 'Percentage'),
        ('fixed', 'Fixed Amount'),
    )

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_CHOICES, default='fixed')
    discount_value = models.DecimalField(max_digits=12, decimal_places=2)
    min_purchase = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    
    valid_from = models.DateTimeField()
    valid_to = models.DateTimeField()
    active = models.BooleanField(default=True)
    
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} ({self.discount_value} {self.discount_type})"

    def is_valid(self, subtotal=None):
        from django.utils import timezone
        now = timezone.now()
        if not self.active:
            return False, "Coupon is not active."
        if now < self.valid_from:
            return False, "Coupon is not yet valid."
        if now > self.valid_to:
            return False, "Coupon has expired."
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False, "Coupon usage limit reached."
        if subtotal is not None and subtotal < self.min_purchase:
            return False, f"Minimum purchase of {self.min_purchase} required."
        return True, ""

    def calculate_discount(self, subtotal):
        if self.discount_type == 'percentage':
            return (self.discount_value / Decimal('100')) * subtotal
        return min(self.discount_value, subtotal)

# 2. Payment Info Model


class PaymentInfo(models.Model):
    """
    Stores payment transaction details.
    """
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    payment_method = models.CharField(
        max_length=50, default='cod', help_text="e.g. 'stripe', 'cod'")
    payment_date = models.DateTimeField(blank=True, null=True)
    paid_from = models.CharField(blank=True, null=True, help_text="Source or payer info")
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.transaction_id or 'Pending'} - {'Paid' if self.is_paid else 'Unpaid'}"

# 3. Cart Model


class Cart(models.Model):
    """
    Shopping cart for session or user.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Cart {self.id} ({self.user.username if self.user else self.session_key})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items',
                             on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        if self.variant:
            return f"{self.quantity} x {self.product.name} ({self.variant.sku})"
        return f"{self.quantity} x {self.product.name}"

# 4. Checkout Model


class Checkout(models.Model):
    """
    Handles checkout process data.
    """
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE)
    shipping_address = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='checkouts_shipping')
    billing_address = models.ForeignKey(
        Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='checkouts_billing')
    email = models.EmailField(blank=True, null=True)  # For guest checkout
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Checkout {self.id}"

# 5. Order Model (Transferred)


class Order(models.Model):
    customer = models.ForeignKey(
        Customer, on_delete=models.CASCADE, related_name='orders', null=True, blank=True)

    # Guest / Snapshot Address Fields
    email = models.EmailField(blank=True, null=True)
    full_name = models.CharField(max_length=200, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    shipping_address = models.TextField(
        blank=True, null=True, help_text="Street Address")
    division = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    sub_district = models.CharField(max_length=100, blank=True, null=True)
    address_type = models.CharField(
        max_length=20, blank=True, null=True, help_text="Home, Office, etc.")

    # Legacy Link (Optional - keep for authenticated users if needed, or deprecate)
    address = models.ForeignKey(
        Address, on_delete=models.PROTECT, null=True, blank=True)

    total_amount = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'), help_text="Final amount to be paid (Grand Total)")

    delivery_charge = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'))

    # Linked to OrderStatus
    order_status = models.ForeignKey(
        OrderStatus, on_delete=models.PROTECT, null=True, blank=True)

    # Linked to PaymentInfo
    payment_info = models.OneToOneField(
        PaymentInfo, on_delete=models.PROTECT, null=True, blank=True)

    # Linked to Coupon
    coupon = models.ForeignKey(
        Coupon, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        customer_name = self.customer.name if self.customer else (
            self.full_name or "Guest")
        return f"Order #{self.id} - {customer_name}"

    @property
    def subtotal(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def grand_total(self):
        """Calculates what the total_amount SHOULD be."""
        return self.subtotal + self.delivery_charge + self.tax - self.discount

    @property
    def paid_amount(self):
        """Returns the amount already paid."""
        if self.payment_info:
            # If specifically marked as paid, we assume at least grand_total was paid
            # But we prefer the actual recorded amount if it exists
            if self.payment_info.is_paid:
                return max(self.payment_info.amount, self.grand_total)
            return self.payment_info.amount
        return Decimal('0.00')

    @property
    def due_amount(self):
        """Remaining balance to be paid."""
        if self.payment_info and self.payment_info.is_paid:
            return Decimal('0.00')
        return self.grand_total - self.paid_amount

    def update_total_amount(self):
        self.total_amount = self.grand_total
        self.save(update_fields=['total_amount'])

    @staticmethod
    def get_delivery_charge(district, sub_district):
        """
        Calculates delivery charge based on location.
        - Kishoreganj (District): 60
        - Kishoreganj Sadar (Sub-district): 0
        - Others: 120
        """
        if not district:
            return Decimal('120.00')

        d_name = str(district).strip().lower()
        s_name = str(sub_district).strip().lower() if sub_district else ""

        if "kishoreganj" in d_name:
            if "sadar" in s_name:
                return Decimal('0.00')
            return Decimal('60.00')

        return Decimal('120.00')


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    variant = models.ForeignKey(
        ProductVariant, on_delete=models.PROTECT, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal('0.00'))

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new and self.product:
            # Only auto-fill price when not explicitly provided
            try:
                price_zero = (self.price is None) or (
                    self.price == Decimal('0.00'))
            except Exception:
                price_zero = True
            if price_zero:
                is_wholesaler = False
                if self.order.customer and self.order.customer.customer_type == 'wholesale':
                    is_wholesaler = True
                
                if self.variant:
                    self.price = self.variant.wholesale_price if is_wholesaler and self.variant.wholesale_price else self.variant.price
                else:
                    self.price = self.product.wholesale_price if is_wholesaler and self.product.wholesale_price else self.product.price
        super().save(*args, **kwargs)
        # update order total
        self.order.update_total_amount()

    def delete(self, *args, **kwargs):
        order = self.order
        super().delete(*args, **kwargs)
        order.update_total_amount()

    @property
    def subtotal(self):
        return self.price * self.quantity
