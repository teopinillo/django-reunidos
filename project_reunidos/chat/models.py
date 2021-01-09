from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth import get_user_model

# Create your models here.
class User(AbstractUser):    
    following = models.ForeignKey(
        'self',
        null = True,
        blank = True,
        default = None,
        on_delete=models.CASCADE,
    )

class Post (models.Model):
    author = models.ForeignKey (get_user_model(), on_delete=models.CASCADE)
    content = models.CharField (max_length=1024)
    timestamp = models.DateTimeField (auto_now = False, auto_now_add=True)
    total_likes = models.IntegerField (default=0)
    likes = models.ManyToManyField( User, related_name='network_posts')

    def __str__(self):
        formatedDate = self.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        return 'author:' + str (self.author) + ', post:' +self.content + ' ' + formatedDate + ', likes:' + str(self.total_likes)

class Like (models.Model):
    user = models.ForeignKey (get_user_model(), on_delete = models.CASCADE)
    post = models.ForeignKey ('Post', on_delete=models.CASCADE)

    def __str__(self):
        return str(self.user)+':'+str(self.post)