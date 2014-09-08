# Dockerfile for the backend of Gazetteer

FROM ubuntu:12.04
MAINTAINER Han Xu <han@hxu.io>

# Basic packages
RUN apt-get update
RUN apt-get -y install build-essential python-dev python-setuptools python-virtualenv python-pip vim tmux htop git libffi-dev libxml2-dev libxslt1-dev curl python-software-properties software-properties-common

# Project requirements file
COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

# Program files and data files
COPY backend /srv/hk_census_explorer/backend

# Copy scripts for running data prep
COPY scripts /srv/hk_census_explorer/scripts

RUN python /srv/hk_census_explorer/scripts/data_preparation.py

WORKDIR /srv/hk_census_explorer/backend
EXPOSE 8080
ENTRYPOINT ["uwsgi"]
CMD ["uwsgi.ini"]
