from rest_framework import serializers
from django.contrib.auth.models import User


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=64)
    username = serializers.CharField(max_length=32)
    password = serializers.CharField(min_length=8)

    def validate_email(self, value):
        user = User.objects.filter(email=value)
        if user.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        user = User.objects.filter(username=value)
        if user.exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value
