#!/bin/bash
set -e

echo "Looking for static files..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate

echo "Seeding database (if empty)..."
python manage.py seed_db

echo "Starting Gunicorn..."
gunicorn PSM.wsgi:application --bind 0.0.0.0:$PORT