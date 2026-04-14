import django_filters
from .models import DevFeedback


class DevFeedbackFilter(django_filters.FilterSet):
    type = django_filters.ChoiceFilter(choices=DevFeedback.FeedbackType.choices)
    priority = django_filters.ChoiceFilter(choices=DevFeedback.Priority.choices)
    status = django_filters.ChoiceFilter(choices=DevFeedback.Status.choices)
    assigned_to = django_filters.NumberFilter(field_name='assigned_to__id')
    assigned_to__isnull = django_filters.BooleanFilter(field_name='assigned_to', lookup_expr='isnull')
    created_after = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateTimeFilter(field_name='created_at', lookup_expr='lte')

    class Meta:
        model = DevFeedback
        fields = ['type', 'priority', 'status', 'assigned_to']
