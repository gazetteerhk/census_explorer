# The base image contains all the dependencies
FROM hupili/hkcensus-base
MAINTAINER Pili Hu <docker@hupili.net>

# This helps to persist code change into an image ready to publish
ADD nginx.conf /etc/nginx/conf.d/nginx.conf 
ADD . /srv/hk_census_explorer/
WORKDIR /srv/hk_census_explorer/

CMD ["./census.sh"]
