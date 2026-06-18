from django.contrib import admin
from .models import Country, Category, Channel

@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'flag_icon', 'created_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_per_page = 25

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_per_page = 25

@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'get_category', 'is_active', 'created_at')
    list_filter = ('country', 'is_active') # category এখানে থাকবে না
    search_fields = ('name', 'stream_url')
    list_editable = ('is_active',)
    autocomplete_fields = ('country',) # category এখানে থাকবে না
    list_per_page = 50

    def get_category(self, obj):
        return obj.category.name if obj.category else "No Category"
    get_category.short_description = 'Category'