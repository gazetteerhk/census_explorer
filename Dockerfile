# Dockerfile for the backend of Gazetteer

FROM ubuntu:16.04
MAINTAINER Han Xu <han@hxu.io>

# Basic packages
RUN apt-get update
RUN apt-get -y install \
    build-essential \
    python-dev \
    python-setuptools \
    python-virtualenv \
    python-pip \
    vim \
    tmux \
    htop \
    git \
    libffi-dev \
    libxml2-dev \
    libxslt1-dev \
    curl \
    python-software-properties \
    software-properties-common \
    python-numpy \
    nginx


ADD . /srv/hk_census_explorer/
WORKDIR /srv/hk_census_explorer/

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs

# RUN apt-get install -y phantomjs
# RUN apt-get install -y x11-xserver-utils
# To solve a problem with phantomjs
# ENV QT_QPA_PLATFORM offscreen
# ENV DISPLAY :0
# RUN npm install -g bower

WORKDIR /srv/hk_census_explorer/frontend
RUN npm install -g grunt-cli
RUN npm install -g yarn
# The command line given by bower-away
RUN yarn --ignore-engines --ignore-scripts && yarn postinstall

WORKDIR /srv/hk_census_explorer/

ADD nginx.conf /etc/nginx/conf.d/nginx.conf 

EXPOSE 8888
# ENTRYPOINT ["uwsgi"]

CMD ["./census.sh"]
