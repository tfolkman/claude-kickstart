import { BasePlugin } from './base-plugin.js';

export class RailsPlugin extends BasePlugin {
  static get metadata() {
    return {
      name: 'rails',
      displayName: 'Ruby on Rails',
      category: 'stack',
      projectTypes: ['fullstack', 'backend'],
      languages: ['Ruby'],
      icon: '💎',
      description: 'Convention over configuration web framework for Ruby'
    };
  }

  getDependencies() {
    const deps = ['rails', 'pg', 'puma', 'sass-rails', 'image_processing', 'jbuilder', 'bootsnap'];
    
    if (this.config.database === 'mysql') {
      deps.push('mysql2');
    } else if (this.config.database === 'sqlite') {
      deps.push('sqlite3');
    }

    if (this.config.authentication === 'devise') {
      deps.push('devise');
    }

    return {
      production: deps,
      development: this.getDevDependencies()
    };
  }

  getDevDependencies() {
    const deps = ['debug', 'web-console'];

    if (this.config.testing === 'rspec') {
      deps.push('rspec-rails', 'factory_bot_rails', 'faker');
    }

    return deps;
  }

  getFileStructure() {
    return `app/
├── assets/
│   ├── config/
│   │   └── manifest.js
│   ├── images/
│   └── stylesheets/
│       └── application.css
├── channels/
│   └── application_cable/
├── controllers/
│   ├── application_controller.rb
│   ├── users_controller.rb
│   └── api/
│       └── v1/
├── helpers/
│   └── application_helper.rb
├── jobs/
│   └── application_job.rb
├── mailers/
│   └── application_mailer.rb
├── models/
│   ├── application_record.rb
│   └── user.rb
├── views/
│   ├── layouts/
│   │   └── application.html.erb
│   └── users/
├── javascript/
│   └── application.js
└── controllers/
    └── concerns/
bin/
├── bundle
├── rails
├── rake
├── setup
└── update
config/
├── application.rb
├── boot.rb
├── cable.yml
├── credentials.yml.enc
├── database.yml
├── environment.rb
├── master.key
├── puma.rb
├── routes.rb
├── storage.yml
├── environments/
│   ├── development.rb
│   ├── production.rb
│   └── test.rb
├── initializers/
│   ├── application_controller_renderer.rb
│   ├── assets.rb
│   ├── content_security_policy.rb
│   ├── cors.rb
│   ├── filter_parameter_logging.rb
│   ├── inflections.rb
│   ├── mime_types.rb
│   ├── permissions_policy.rb
│   └── wrap_parameters.rb
└── locales/
    └── en.yml
db/
├── migrate/
├── schema.rb
└── seeds.rb
lib/
├── assets/
└── tasks/
log/
public/
├── 404.html
├── 422.html
├── 500.html
├── apple-touch-icon-precomposed.png
├── apple-touch-icon.png
├── favicon.ico
└── robots.txt
storage/
test/ (or spec/ if using RSpec)
tmp/
vendor/
.gitignore
.ruby-version
Gemfile
Gemfile.lock
README.md
Rakefile
config.ru`;
  }

  getConfigFiles() {
    const files = [];

    // Gemfile
    files.push({
      name: 'Gemfile',
      language: 'ruby',
      content: `source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.0"

# Bundle edge Rails instead: gem "rails", github: "rails/rails", branch: "main"
gem "rails", "~> 7.0.4"

# The original asset pipeline for Rails [https://github.com/rails/sprockets-rails]
gem "sprockets-rails", ">= 3.4.0"

# Use postgresql as the database for Active Record
gem "pg", "~> 1.1"

# Use the Puma web server [https://github.com/puma/puma]
gem "puma", "~> 5.0"

# Use JavaScript with ESM import maps [https://github.com/rails/importmap-rails]
gem "importmap-rails"

# Hotwire's SPA-like page accelerator [https://turbo.hotwired.dev]
gem "turbo-rails"

# Hotwire's modest JavaScript framework [https://stimulus.hotwired.dev]
gem "stimulus-rails"

# Build JSON APIs with ease [https://github.com/rails/jbuilder]
gem "jbuilder"

# Use Redis adapter to run Action Cable in production
# gem "redis", "~> 4.0"

# Use Kredis to get higher-level data types in Redis [https://github.com/rails/kredis]
# gem "kredis"

# Use Active Model has_secure_password [https://guides.rubyonrails.org/active_model_basics.html#securepassword]
# gem "bcrypt", "~> 3.1.7"

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]

# Reduces boot times through caching; required in config/boot.rb
gem "bootsnap", require: false

# Use Sass to process CSS
# gem "sassc-rails"

# Use image_processing for Active Storage
gem "image_processing", "~> 1.2"

group :development, :test do
  # See https://guides.rubyonrails.org/debugging_rails_applications.html#debugging-with-the-debug-gem
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
  gem "rspec-rails" if ${this.config.testing === 'rspec' ? 'true' : 'false'}
  gem "factory_bot_rails" if ${this.config.testing === 'rspec' ? 'true' : 'false'}
  gem "faker" if ${this.config.testing === 'rspec' ? 'true' : 'false'}
end

group :development do
  # Use console on exceptions pages [https://github.com/rails/web-console]
  gem "web-console"

  # Add speed badges [https://github.com/MiniProfiler/rack-mini-profiler]
  # gem "rack-mini-profiler"

  # Speed up commands on slow machines / big apps [https://github.com/rails/spring]
  # gem "spring"
end`
    });

    // Application configuration
    files.push({
      name: 'config/application.rb',
      language: 'ruby',
      content: `require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module RailsApp
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Don't generate system test files.
    config.generators.system_tests = nil

    # API mode configuration
    # config.api_only = true
  end
end`
    });

    // Database configuration
    files.push({
      name: 'config/database.yml',
      language: 'yaml',
      content: `# PostgreSQL. Versions 9.3 and up are supported.
#
# Install the pg driver:
#   gem install pg
# On macOS with Homebrew:
#   gem install pg -- --with-pg-config=/usr/local/bin/pg_config
# On macOS with MacPorts:
#   gem install pg -- --with-pg-config=/opt/local/lib/postgresql84/bin/pg_config
# On Windows:
#   gem install pg
#       Choose the win32 build.
#       Install PostgreSQL and put its /bin directory on your path.
#
# Configure Using Gemfile
# gem "pg"
#
default: &default
  adapter: postgresql
  encoding: unicode
  # For details on connection pooling, see Rails configuration guide
  # https://guides.rubyonrails.org/configuring.html#database-pooling
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: rails_app_development

  # The specified database role being used to connect to postgres.
  # To create additional roles in postgres see \`$ createuser --help\`.
  # When left blank, postgres will use the default role. This is
  # the same name as the operating system user running Rails.
  #username: rails_app

  # The password associated with the postgres role (username).
  #password:

  # Connect on a TCP socket. Omitted by default since the client uses a
  # domain socket that doesn't need configuration. Windows does not have
  # domain sockets, so uncomment these lines.
  #host: localhost

  # The TCP port the server listens on. Defaults to 5432.
  # If your server runs on a different port number, change accordingly.
  #port: 5432

  # Schema search path. The server defaults to $user,public
  #schema_search_path: myapp,sharedapp,public

  # Minimum log levels, in increasing order:
  #   debug5, debug4, debug3, debug2, debug1,
  #   log, notice, warning, error, fatal, and panic
  # Defaults to warning.
  #min_messages: notice

# Warning: The database defined as "test" will be erased and
# re-generated from your development database when you run "rake".
# Do not set this db to the same as development or production.
test:
  <<: *default
  database: rails_app_test

# As with config/credentials.yml, you never want to store sensitive information,
# like your database password, in your source code. If your source code is
# ever seen by anyone, they now have access to your database.
#
# Instead, provide the password or a full connection URL as an environment
# variable when you boot the app. For example:
#
#   DATABASE_URL="postgres://myuser:mypass@localhost/somedatabase"
#
# If the connection URL is provided in the special DATABASE_URL environment
# variable, Rails will automatically merge its configuration values on top of
# the values provided in this file. Alternatively, you can specify a connection
# URL environment variable explicitly:
#
#   production:
#     url: <%= ENV["MY_APP_DATABASE_URL"] %>
#
# Read https://guides.rubyonrails.org/configuring.html#configuring-a-database
# for a full overview on how database connection configuration can be specified.
#
production:
  <<: *default
  database: rails_app_production
  username: rails_app
  password: <%= ENV["RAILS_APP_DATABASE_PASSWORD"] %>`
    });

    // Routes
    files.push({
      name: 'config/routes.rb',
      language: 'ruby',
      content: `Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  root "users#index"

  # API routes
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show, :create, :update, :destroy]
      # Authentication routes
      post '/auth/login', to: 'authentication#login'
      post '/auth/logout', to: 'authentication#logout'
    end
  end

  # Web routes
  resources :users
end`
    });

    // User model
    files.push({
      name: 'app/models/user.rb',
      language: 'ruby',
      content: `class User < ApplicationRecord
  # Include default devise modules if using Devise
  # devise :database_authenticatable, :registerable,
  #        :recoverable, :rememberable, :validatable

  # Validations
  validates :name, presence: true, length: { maximum: 50 }
  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  
  # Secure password (if not using Devise)
  has_secure_password

  # Callbacks
  before_save { self.email = email.downcase }

  # Scopes
  scope :active, -> { where(active: true) }

  # Instance methods
  def full_name
    "\#{first_name} \#{last_name}".strip
  end

  def admin?
    role == 'admin'
  end
end`
    });

    // Application controller
    files.push({
      name: 'app/controllers/application_controller.rb',
      language: 'ruby',
      content: `class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # Authentication
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  private

  def authenticate_user!
    redirect_to login_path unless user_signed_in?
  end

  def user_signed_in?
    session[:user_id].present?
  end

  def current_user
    @current_user ||= User.find(session[:user_id]) if session[:user_id]
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :email])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :email])
  end

  helper_method :current_user, :user_signed_in?
end`
    });

    return files;
  }

  getCommands() {
    return {
      dev: 'rails server',
      start: 'rails server -e production',
      console: 'rails console',
      test: 'rails test',
      'test:rspec': 'rspec',
      'db:create': 'rails db:create',
      'db:migrate': 'rails db:migrate',
      'db:seed': 'rails db:seed',
      'db:reset': 'rails db:reset',
      generate: 'rails generate',
      routes: 'rails routes'
    };
  }

  getMarkdownSections() {
    return [
      {
        title: '💎 Ruby on Rails Application',
        content: `This is a Ruby on Rails application with:

- **Convention over Configuration**: Follows Rails conventions for rapid development
- **Active Record ORM**: Powerful database abstraction layer
- **MVC Architecture**: Clean separation of concerns
- **RESTful Routing**: Resource-oriented URL design
- **Action Cable**: WebSocket integration for real-time features
- **Active Job**: Background job processing
- **Active Storage**: File upload and cloud storage integration

### Key Features:
- \`app/models/\` - Active Record models
- \`app/controllers/\` - Request handling logic
- \`app/views/\` - ERB templates for HTML rendering
- \`config/routes.rb\` - URL routing configuration
- \`db/migrate/\` - Database schema migrations

### Development:
\`\`\`bash
bundle install      # Install gem dependencies
rails db:create     # Create database
rails db:migrate    # Run migrations
rails db:seed       # Seed database with initial data
rails server        # Start development server
\`\`\`

### Common Commands:
\`\`\`bash
rails generate model User name:string email:string
rails generate controller Users index show new
rails db:migrate
rails routes        # View all routes
rails console       # Interactive Ruby console
\`\`\``
      }
    ];
  }

  getSupportedFeatures() {
    return ['mvc', 'orm', 'migrations', 'routing', 'templating', 'real-time'];
  }

  getSecurityGuidelines() {
    return [
      'Use strong parameters to prevent mass assignment',
      'Enable CSRF protection for all forms',
      'Validate and sanitize all user inputs',
      'Use Rails\' built-in XSS protection',
      'Keep Rails and gems updated',
      'Use environment variables for secrets',
      'Enable force_ssl in production',
      'Implement proper authorization with CanCan or Pundit',
      'Use secure_headers gem for security headers',
      'Validate file uploads properly'
    ];
  }

  getTestingStrategy() {
    if (this.config.testing === 'rspec') {
      return `- Model specs for business logic and validations
- Controller specs for request/response handling
- View specs for template rendering
- Feature specs for user interactions
- Use FactoryBot for test data generation
- Mock external services with VCR or WebMock`;
    }

    return `- Use Rails' built-in testing framework
- Model tests for validations and associations
- Controller tests for request handling
- Integration tests for user workflows
- System tests for full-stack testing
- Use fixtures or factories for test data`;
  }

  getUIGuidelines() {
    return `### Rails Best Practices:
- Follow RESTful routing conventions
- Use partials for reusable view components
- Implement proper error handling and flash messages
- Use Rails helpers for common view logic
- Keep controllers thin, models fat
- Use concerns for shared functionality
- Implement responsive design with CSS frameworks
- Use Rails UJS for AJAX interactions`;
  }

  getLanguageExtension() {
    return 'rb';
  }

  getTemplateVariables() {
    return {
      isRails: true,
      hasActiveRecord: true,
      hasMVC: true,
      hasConventions: true,
      hasRuby: true,
      hasRESTful: true
    };
  }

  isCompatibleWith(otherPlugin) {
    // Rails is a full-stack framework
    const incompatible = ['nextjs-app', 'nextjs-pages', 'remix', 't3', 'mern', 'mean', 'express', 'fastify', 'django', 'fastapi'];
    return !incompatible.includes(otherPlugin.constructor.metadata.name);
  }
}