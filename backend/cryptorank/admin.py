from django.contrib import admin

from .models import Exchange


@admin.register(Exchange)
class ExcahngeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name',)