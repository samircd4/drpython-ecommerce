from rest_framework import permissions

class StaffHasActionPermission(permissions.BasePermission):
    """
    Granular permissions for staff members.
    - Safe methods (GET, HEAD, OPTIONS) are allowed for all authenticated staff.
    - Write methods (POST, PUT, PATCH, DELETE) require specific model permissions.
    - Regular customers are handled by the view's get_queryset (ownership).
    """

    def has_permission(self, request, view):
        # 1. Allow anything for superusers
        if request.user.is_superuser:
            return True

        # 2. Extract model info from the view
        queryset = getattr(view, 'get_queryset', None)
        if queryset is None:
            return False
            
        model = queryset().model
        app_label = model._meta.app_label
        model_name = model._meta.model_name

        # 3. Check for Staff status
        if request.user.is_staff:
            # All staff can VIEW (Safe methods)
            if request.method in permissions.SAFE_METHODS:
                return True
            
            # For other methods, check for specific Django perms
            perm_map = {
                'POST': f'{app_label}.add_{model_name}',
                'PUT': f'{app_label}.change_{model_name}',
                'PATCH': f'{app_label}.change_{model_name}',
                'DELETE': f'{app_label}.delete_{model_name}',
            }
            
            required_perm = perm_map.get(request.method)
            return request.user.has_perm(required_perm)

        # 4. For non-staff (customers), we rely on IsAuthenticated 
        # plus the view's internal logic (like get_queryset filtering)
        return request.user.is_authenticated

class IsReviewOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission for reviews.
    Customers edit their own. Staff edit/delete based on perms.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user.is_staff:
            if request.user.is_superuser:
                return True
            
            # Check for specific review management perm if deleting
            if request.method == 'DELETE':
                return request.user.has_perm('reviews.delete_review')
            return request.user.has_perm('reviews.change_review')

        # Customer ownership check
        return obj.customer.user == request.user
