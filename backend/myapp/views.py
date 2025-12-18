from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token

from .models import UserProfile, UserPreferences
from .serializers import UserProfileSerializer, UserPreferencesSerializer, UserSerializer


class AuthViewSet(viewsets.ViewSet):
    """
    Auth endpoints: signup + login
    Public (no token required).
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"], url_path="signup")
    def signup(self, request):
        username = request.data.get("username", "").strip()
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"error": "username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {"error": "Username already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if email and User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(username=username, email=email, password=password)

        # Create profile + default preferences
        profile = UserProfile.objects.create(user=user)
        prefs = UserPreferences.objects.create(user=profile)

        token, _ = Token.objects.get_or_create(user=user)

        return Response(
            {
                "message": "User created successfully",
                "token": token.key,
                "user": UserSerializer(user).data,
                "profile": UserProfileSerializer(profile).data,
                "preferences": UserPreferencesSerializer(prefs).data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="login")
    def login(self, request):
        username = request.data.get("username", "").strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"error": "username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"error": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        token, _ = Token.objects.get_or_create(user=user)

        # Ensure profile + preferences exist
        profile, _ = UserProfile.objects.get_or_create(user=user)
        prefs, _ = UserPreferences.objects.get_or_create(user=profile)

        return Response(
            {
                "token": token.key,
                "user": UserSerializer(user).data,
                "profile": UserProfileSerializer(profile).data,
                "preferences": UserPreferencesSerializer(prefs).data,
            },
            status=status.HTTP_200_OK,
        )


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    Protected endpoints for the logged-in user's profile.
    """
    serializer_class = UserProfileSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only allow access to your own profile
        return UserProfile.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Usually profile is created at signup. Prevent random profile creation.
        return Response(
            {"error": "Profile is created automatically. Use PATCH to update."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def perform_update(self, serializer):
        # Ensure profile remains bound to logged-in user
        serializer.save(user=self.request.user)


class UserPreferencesViewSet(viewsets.ModelViewSet):
    """
    Protected endpoints for the logged-in user's preferences.
    """
    serializer_class = UserPreferencesSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # UserPreferences.user -> UserProfile, and UserProfile.user -> User
        return UserPreferences.objects.filter(user__user=self.request.user)

    def create(self, request, *args, **kwargs):
        # Usually preferences are created at signup. Prevent duplicates.
        return Response(
            {"error": "Preferences are created automatically. Use PATCH to update."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """
        Convenience endpoint: GET /api/preferences/me/
        """
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        prefs, _ = UserPreferences.objects.get_or_create(user=profile)
        return Response(UserPreferencesSerializer(prefs).data, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        # Keep preferences attached to the logged-in user's profile
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        serializer.save(user=profile)
