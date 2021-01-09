from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.core.paginator import Paginator
from django.contrib.auth import get_user_model
from django.shortcuts import redirect, get_object_or_404

from .models import User


def index(request):    
    posts = Post.objects.all().order_by('-id')
    paginator = Paginator (posts, 10)
    page_number = request.GET.get('page')
    limit_posts = paginator.get_page(page_number)
    context = {"posts" : limit_posts}
    return render (request, "chat/index.html", context )
    
def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "chat/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "chatlogin.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "chat/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "chat/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "chat/register.html")

@login_required(login_url='/accounts/login/')
@require_http_methods(["POST"])
def new_post (request):
    if request.method == 'POST':
        content = request.POST.get('post_content')
        if content:
            print (content)
        else:
            print ('no data from post_content')
    new_post = Post ( author = request.user, content = content )
    new_post.save()
    return render (request, "chat/index.html", ten_post() )
    
@login_required (login_url='/accounts/login/')
def user_profile (request):
    posts = Post.objects.filter (author = request.user )
    users1 = User.objects.all()
    users2 = users1.exclude ( username = "admin")
    users =  users2.exclude ( username = request.user )

    #    Paginator setup for posts
    paginator = Paginator (posts, 10)
    page_number = request.GET.get('page')
    limit_posts = paginator.get_page(page_number)
    context = {"posts" : limit_posts, "users" : users}
    return render (request, "network/profile.html", context)

@login_required(login_url='/accounts/login/')
@require_http_methods(["POST"])
def like_post (request, post_id ):
    post = get_object_or_404(Post, id = request.POST.get('post_id'))
    post.likes.add(request.user)
    post.total_likes = post.total_likes + 1
    print (post_id)
    user = User.objects.get (pk = request.user.id)
    print (user)
    like = Like ( user = user, post = post )
    print (like)
    post.save()
    like.save()
    return redirect ('index')
    

def my_likes (request):
    user = User.objects.get (pk = request.user.id)
    print (user)
    likes = user.like_set.all()
    print (" ---post user liked --")    
    print (likes)
    return render (request,"chat/likes.html", {"likes":likes})

@login_required(login_url='/accounts/login/')
@require_http_methods(["POST"])
def delete_post (request, post_id):
    post = get_object_or_404(Post, id = request.POST.get('post_id'))
    post.delete()
    return redirect ('index')