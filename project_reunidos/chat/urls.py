
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("reunidos/new_post", views.new_post, name="new_post"),   #12/21/2020
    path("reunidos/profile", views.user_profile, name="user_profile"),   #12/29/2020
    path("reunidos/like_post/<int:post_id>", views.like_post, name="like_post"), #1/2/2021
    path("reunidos/likes",views.my_likes, name="my_likes"), #1/2/2021
    path("reunidos/deletepost/<int:post_id>", views.delete_post, name="delete_post"), #1/3/2021
]
