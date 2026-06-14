from django.contrib import admin
from .models import Country, Channel

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'flag_icon', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)} # নাম লিখলে স্ল্যাগ অটো তৈরি হবে
    list_per_page = 25


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'category', 'is_active', 'created_at')
    list_filter = ('country', 'category', 'is_active')
    search_fields = ('name', 'stream_url')
    list_editable = ('is_active',) # অ্যাডমিন লিস্ট থেকেই অন/অফ করা যাবে
    autocomplete_fields = ('country',) # কান্ট্রি অনেক বেশি হলে সার্চ করে ড্রপডাউন আনার জন্য
    list_per_page = 50