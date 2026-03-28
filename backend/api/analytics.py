from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from orders.models import Order, OrderStatus
from accounts.models import Customer
from reviews.models import Review

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]

    def get(self, request):
        now = timezone.now()
        last_month = now - timedelta(days=30)
        prev_last_month = now - timedelta(days=60)

        # 1. Total Metrics
        total_revenue = Order.objects.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        total_orders = Order.objects.count()
        total_customers = Customer.objects.count()
        total_reviews = Review.objects.count()

        # 2. Percentage Changes (Last 30 days vs Previous 30 days)
        def get_change(model, date_field, current_start, prev_start, prev_end, sum_field=None):
            if sum_field:
                current_val = model.objects.filter(**{f"{date_field}__gte": current_start}).aggregate(total=Sum(sum_field))['total'] or Decimal('0.00')
                prev_val = model.objects.filter(**{f"{date_field}__range": (prev_start, prev_end)}).aggregate(total=Sum(sum_field))['total'] or Decimal('0.00')
            else:
                current_val = model.objects.filter(**{f"{date_field}__gte": current_start}).count()
                prev_val = model.objects.filter(**{f"{date_field}__range": (prev_start, prev_end)}).count()

            if prev_val == 0:
                return "+100%" if current_val > 0 else "0%"
            
            change = ((float(current_val) - float(prev_val)) / float(prev_val)) * 100
            return f"{'+ ' if change >= 0 else '- '}{abs(round(change))}%"

        revenue_change = get_change(Order, 'created_at', last_month, prev_last_month, last_month, 'total_amount')
        orders_change = get_change(Order, 'created_at', last_month, prev_last_month, last_month)
        customers_change = get_change(Customer, 'created_at', last_month, prev_last_month, last_month)
        reviews_change = get_change(Review, 'created_at', last_month, prev_last_month, last_month)

        # 3. Orders Overview (Status Distribution)
        # We fetch ALL statuses to ensure the chart has components for each
        statuses = OrderStatus.objects.all()
        orders_by_status = []
        for s in statuses:
            count = Order.objects.filter(order_status=s).count()
            percentage = round((count / total_orders * 100)) if total_orders > 0 else 0
            orders_by_status.append({
                "label": s.display_name,
                "value": count,
                "percentage": percentage,
                "status_code": s.status_code
            })

        # 4. Popular Clients (Top 6 by Spend)
        popular_clients_qs = Customer.objects.annotate(
            order_count=Count('orders'),
            total_spent=Sum('orders__total_amount')
        ).order_by('-total_spent')[:6]

        popular_clients = []
        for c in popular_clients_qs:
            popular_clients.append({
                "id": c.id,
                "name": c.name or c.user.username,
                "orders": c.order_count,
                "amount": f"৳{c.total_spent or 0}",
                "avatar": f"https://ui-avatars.com/api/?name={c.name or c.user.username}&background=random"
            })

        return Response({
            "summary": [
                {"title": "Total Revenue", "value": f"৳{total_revenue}", "change": revenue_change},
                {"title": "Total Orders", "value": f"{total_orders}", "change": orders_change},
                {"title": "Total Customers", "value": f"{total_customers}", "change": customers_change},
                {"title": "Total Reviews", "value": f"{total_reviews}", "change": reviews_change},
            ],
            "orders_overview": orders_by_status,
            "popular_clients": popular_clients
        })
