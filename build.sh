#!/usr/bin/env bash
# exit on error
set -o errexit
#
#poetry install
pip install -r requirements.txt
#
python manage.py collectstatic --no-input
python manage.py migrate
# 
# echo "from django.contrib.auth.models import User; User.objects.create_superuser('admin', 'admin@amva.com', 'amva2023')" | python manage.py shell
