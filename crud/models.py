from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
# from django.conf import settings
 
class Registration(models.Model):
    email = models.EmailField(unique=True)
    secret_code = models.CharField(max_length=32, unique=True)
    expiration_date = models.DateTimeField()

    def __str__(self):
        return f"Registration for {self.email}"

class Profile (models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    
    usercode = models.BooleanField(default=False)
    country = models.CharField(max_length=400, verbose_name='country')
    city = models.CharField(max_length=400, verbose_name='city')
    entity = models.CharField(max_length=400, verbose_name='entity')

    def __str__(self):
        return f"{self.user.username} ({self.entity})"
    
#this method to generate profile when user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

#this method to update profile when user is updated
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
