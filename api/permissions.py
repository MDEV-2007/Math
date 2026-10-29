from rest_framework.permissions import BasePermission


class IsTeacher(BasePermission):
    message = "Only teachers can perform this action."

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'teacher')


class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        owner = getattr(obj, 'created_by', None) or getattr(obj, 'user', None)
        return owner_id_matches(owner, request.user)


def owner_id_matches(owner, user):
    return bool(owner and user and owner.pk == user.pk)
