from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

from .serializers import RegisterSerializer

class RegisterView(APIView):
    serializer_class = RegisterSerializer
    permission_classes = (AllowAny,)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = User(email=serializer.validated_data['email'], username=serializer.validated_data['username'])
        user.set_password(serializer.validated_data['password'])
        user.save()

        token = RefreshToken.for_user(user)
        return Response({
            "status" : "success",
            'userid' : user.id,
            'refresh': str(token),
            'access': str(token.access_token),
        })
