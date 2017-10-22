# Dockerfile for the backend of Gazetteer

FROM hupili/hkcensus-base
MAINTAINER Pili Hu <docker@hupili.net>

ADD . /srv/hk_census_explorer/
WORKDIR /srv/hk_census_explorer/

CMD ["./census.sh"]
