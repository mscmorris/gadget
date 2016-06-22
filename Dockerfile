# Debian system for running a yeoman scaffolded angular app
FROM debian:latest

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get -yq update && \
    apt-get -yq install python-software-properties software-properties-common \
                        git curl net-tools sudo bzip2 libpng-dev locales-all \
                        python g++ make ruby-compass libfreetype6

RUN curl -sL https://deb.nodesource.com/setup_0.12 | bash - && \
    apt-get -yq install nodejs ruby-compass

RUN npm install -g npm && \
    npm install -g bower grunt-cli jspm gulp

# create a new user because grunt doesn't like running as root
RUN adduser --disabled-password --gecos "" --home "/home/app" app; \
    echo "app ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers


# set HOME so 'npm install' and 'bower install' don't write to /
ENV HOME /home/app

ENV LANG en_US.UTF-8

RUN mkdir /src && chown app:app /src
WORKDIR /src

ADD set_env.sh /usr/local/sbin/
RUN chmod +x /usr/local/sbin/set_env.sh
ENTRYPOINT ["set_env.sh"]

# Run as app user
USER app
RUN git config --global url."https://".insteadOf git://

# Expose the compass server port and live reload ports to the host
# If running on OSX or Windows the ip address to access the port is the
# ip of the boot2docker or docker-machine.

EXPOSE 9000

# default run command if none is provided
CMD ["/bin/bash"]
