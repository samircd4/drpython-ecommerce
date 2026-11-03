from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from notifications.services import notify, notify_staff
from .models import Review, Question


@receiver(post_save, sender=Review, dispatch_uid='review_created_notify_staff')
def review_created(sender, instance, created, **kwargs):
    if not created:
        return
    notify_staff(
        'reviews.view_review',
        type='review',
        title=f'New {instance.rating}★ review',
        message=f'{instance.customer.name or "A customer"} reviewed {instance.product.name}.',
        link='/reviews',
        data={'review_id': instance.id, 'product_id': instance.product_id, 'rating': instance.rating},
    )


@receiver(pre_save, sender=Question, dispatch_uid='question_remember_previous_answer')
def remember_previous_answer(sender, instance, **kwargs):
    instance._previous_answer = (
        Question.objects.filter(pk=instance.pk).values_list('answer', flat=True).first()
        if instance.pk else None
    )


@receiver(post_save, sender=Question, dispatch_uid='question_saved_notify')
def question_saved(sender, instance, created, **kwargs):
    if created:
        # Same permission that gates the admin Product Q&A page
        notify_staff(
            'accounts.view_customer',
            type='review',
            title='New product question',
            message=f'{instance.customer.name or "A customer"} asked about {instance.product.name}.',
            link='/product-qna',
            data={'question_id': instance.id, 'product_id': instance.product_id},
        )
        return

    # First answer: tell the customer who asked
    if instance.answer and not getattr(instance, '_previous_answer', None) and instance.customer.user_id:
        notify(
            instance.customer.user_id,
            type='review',
            title='Your question was answered',
            message=f'We answered your question about {instance.product.name}.',
            link=f'/product/{instance.product.slug}',
            data={'question_id': instance.id, 'product_id': instance.product_id},
        )
