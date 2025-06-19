import { BasePlugin } from './base-plugin.js';

export class DjangoPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'django',
      displayName: 'Python + Django',
      category: 'stack',
      projectTypes: ['backend', 'fullstack'],
      languages: ['Python'],
      icon: '🎸',
      description: 'High-level Python web framework that encourages rapid development'
    };
  }

  static get requirements() {
    return {
      python: '>=3.8.0',
      pip: '>=21.0.0'
    };
  }

  getDependencies() {
    const deps = ['Django>=4.2,<5.0', 'djangorestframework', 'django-cors-headers', 'python-dotenv'];
    
    if (this.config.database === 'postgresql') {
      deps.push('psycopg2-binary');
    } else if (this.config.database === 'mysql') {
      deps.push('mysqlclient');
    }

    if (this.config.authentication === 'jwt') {
      deps.push('djangorestframework-simplejwt');
    }

    if (this.config.caching) {
      deps.push('redis', 'django-redis');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    return [
      'pytest',
      'pytest-django',
      'black',
      'flake8',
      'mypy',
      'django-debug-toolbar',
      'factory-boy',
      'coverage'
    ];
  }

  getFileStructure() {
    return `myproject/
├── manage.py
├── myproject/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── __init__.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── migrations/
│   │       └── __init__.py
│   └── core/
│       ├── __init__.py
│       ├── permissions.py
│       ├── pagination.py
│       └── middleware.py
├── api/
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   ├── urls.py
│   │   └── views.py
│   └── urls.py
├── static/
├── media/
├── templates/
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   └── test_views.py
├── requirements/
│   ├── base.txt
│   ├── development.txt
│   └── production.txt
├── .env.example
└── pytest.ini`;
  }

  getConfigFiles() {
    const files = [];

    // Django settings - base
    files.push({
      name: 'myproject/settings/base.py',
      language: 'python',
      content: `"""
Django settings for myproject project.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-me-in-production')

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
]

LOCAL_APPS = [
    'apps.users',
    'apps.core',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'myproject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'myproject.wsgi.application'
ASGI_APPLICATION = 'myproject.asgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

CORS_ALLOW_CREDENTIALS = True`
    });

    // Development settings
    files.push({
      name: 'myproject/settings/development.py',
      language: 'python',
      content: `from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Database for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Development-specific apps
INSTALLED_APPS += [
    'django_extensions',
]

# CORS settings for development
CORS_ALLOW_ALL_ORIGINS = True

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}`
    });

    // Main URLs
    files.push({
      name: 'myproject/urls.py',
      language: 'python',
      content: `"""myproject URL Configuration"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "OK", "message": "Django is running"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health_check, name='health_check'),
    path('api/', include('api.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)`
    });

    // API URLs
    files.push({
      name: 'api/urls.py',
      language: 'python',
      content: `from django.urls import path, include

urlpatterns = [
    path('v1/', include('api.v1.urls')),
]`
    });

    files.push({
      name: 'api/v1/urls.py',
      language: 'python',
      content: `from django.urls import path, include

urlpatterns = [
    path('users/', include('apps.users.urls')),
    path('auth/', include('rest_framework.urls')),
]`
    });

    // User model
    files.push({
      name: 'apps/users/models.py',
      language: 'python',
      content: `from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model that extends the default Django user
    """
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class Profile(models.Model):
    """
    User profile model to store additional user information
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.user.email}'s profile"`
    });

    // User serializers
    files.push({
      name: 'apps/users/serializers.py',
      language: 'python',
      content: `from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['bio', 'avatar', 'phone_number']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'is_active', 'created_at', 'profile'
        ]
        read_only_fields = ['id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm'
        ]

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(user=user)
        return user`
    });

    // User views
    files.push({
      name: 'apps/users/views.py',
      language: 'python',
      content: `from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Profile
from .serializers import UserSerializer, UserCreateSerializer, ProfileSerializer

User = get_user_model()


class UserListCreateView(generics.ListCreateAPIView):
    """
    List all users or create a new user
    """
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a user instance
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """
    Get current authenticated user
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)`
    });

    // User URLs
    files.push({
      name: 'apps/users/urls.py',
      language: 'python',
      content: `from django.urls import path
from . import views

urlpatterns = [
    path('', views.UserListCreateView.as_view(), name='user-list-create'),
    path('me/', views.current_user, name='current-user'),
    path('<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),
]`
    });

    // Django manage.py
    files.push({
      name: 'manage.py',
      language: 'python',
      content: `#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


if __name__ == '__main__':
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)`
    });

    // Requirements files
    files.push({
      name: 'requirements/base.txt',
      language: 'text',
      content: this.getDependencies().production.join('\n')
    });

    files.push({
      name: 'requirements/development.txt',
      language: 'text',
      content: `-r base.txt
${this.getDevDependencies().join('\n')}`
    });

    // Environment file
    files.push({
      name: '.env.example',
      language: 'bash',
      content: `# Django Configuration
SECRET_KEY="django-insecure-change-me-in-production"
DEBUG=True
ALLOWED_HOSTS="localhost,127.0.0.1"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Email Configuration
EMAIL_BACKEND="django.core.mail.backends.console.EmailBackend"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=""
EMAIL_HOST_PASSWORD=""

# Redis (for caching and sessions)
REDIS_URL="redis://localhost:6379/0"

# Static and Media Files
STATIC_URL="/static/"
MEDIA_URL="/media/"`
    });

    // Pytest configuration
    files.push({
      name: 'pytest.ini',
      language: 'ini',
      content: `[tool:pytest]
DJANGO_SETTINGS_MODULE = myproject.settings.testing
python_files = tests.py test_*.py *_tests.py
addopts = --nomigrations --cov=. --cov-report=html`
    });

    return files;
  }

  getCommands() {
    return {
      dev: 'python manage.py runserver',
      start: 'gunicorn myproject.wsgi:application',
      test: 'pytest',
      lint: 'black . && flake8 . && mypy .',
      migrate: 'python manage.py migrate',
      'migrate:create': 'python manage.py makemigrations',
      shell: 'python manage.py shell',
      collectstatic: 'python manage.py collectstatic --noinput',
      createsuperuser: 'python manage.py createsuperuser'
    };
  }

  getMarkdownSections() {
    const sections = [];

    sections.push({
      title: '🎸 Django Web Application',
      content: `This is a production-ready Django application with:

- **Django REST Framework**: Powerful toolkit for building Web APIs
- **Custom User Model**: Extended user model with profiles
- **Clean Architecture**: Organized apps structure with separation of concerns
- **Settings Management**: Environment-based settings configuration
- **Security**: Built-in Django security features and best practices
- **Admin Interface**: Django admin for easy content management

### API Endpoints:
- \`GET /health/\` - Health check
- \`GET /admin/\` - Django admin interface
- \`GET /api/v1/users/\` - List users
- \`POST /api/v1/users/\` - Create user
- \`GET /api/v1/users/me/\` - Current user profile

### Development:
\`\`\`bash
pip install -r requirements/development.txt  # Install dependencies
python manage.py migrate  # Run database migrations
python manage.py createsuperuser  # Create admin user
python manage.py runserver  # Start development server
pytest  # Run tests
\`\`\``
    });

    if (this.config.database && this.config.database !== 'sqlite') {
      sections.push({
        title: '🗄️ Database Integration',
        content: `Database configuration for ${this.getDatabaseLabel()}:

- Django ORM with model definitions
- Database migrations with Django's migration system
- Connection pooling and optimization
- Admin interface for data management
- Custom user model with profile extension

### Setup:
1. Create your database
2. Update \`DATABASE_URL\` in \`.env\`
3. Run \`python manage.py migrate\` for initial setup
4. Create superuser with \`python manage.py createsuperuser\``
      });
    }

    return sections;
  }

  getDatabaseLabel() {
    const labels = {
      'postgresql': 'PostgreSQL',
      'mysql': 'MySQL',
      'sqlite': 'SQLite'
    };
    return labels[this.config.database] || this.config.database;
  }

  getSupportedFeatures() {
    return ['rest-api', 'orm', 'admin-interface', 'authentication', 'database', 'migrations', 'templating'];
  }

  getSecurityGuidelines() {
    return [
      'Always use Django forms for user input validation',
      'Enable CSRF protection for forms',
      'Use Django ORM to prevent SQL injection',
      'Implement rate limiting for API endpoints',
      'Use HTTPS in production',
      'Store sensitive data in environment variables',
      'Use Django security middleware',
      'Hash passwords using Django auth system',
      'Validate and sanitize all user inputs',
      'Use permissions and authentication decorators',
      'Enable security headers in production',
      'Regularly update Django and dependencies'
    ];
  }

  getTestingStrategy() {
    return `- Unit tests for models, views, and serializers
- Integration tests for API endpoints
- Database tests with test database
- Use Django test client for HTTP testing
- Mock external services in tests
- Test authentication and permissions
- Use factory_boy for test data generation
- Test database migrations`;
  }

  getLanguageExtension() {
    return 'py';
  }

  getTemplateVariables() {
    return {
      isDjango: true,
      hasRESTAPI: true,
      hasORM: true,
      hasAdminInterface: true,
      hasMigrations: true,
      hasAuthentication: true,
      hasTemplating: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Django is compatible with most plugins except other backend frameworks
    const incompatible = ['express', 'fastify', 'fastapi', 'rails', 'gin'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}