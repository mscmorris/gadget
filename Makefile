# Simple Makefile for use with make
# See, https://www.digitalocean.com/community/tutorials/how-to-use-makefiles-to-automate-repetitive-tasks-on-an-ubuntu-vps

PROJECT		 ?= ig
TAG				 ?= latest

ifdef REGISTRY
	IMAGE=$(REGISTRY)/$(PROJECT):$(TAG)
else
	IMAGE=$(PROJECT):$(TAG)
endif

test:


build: Dockerfile
		docker build -t $(IMAGE) .

install: Dockerfile
		docker run -it --rm -v $(shell pwd):/src $(IMAGE) npm install

serve: Dockerfile
		docker run -it -p 9000:9000 --rm -v $(shell pwd):/src $(IMAGE) gulp serve

clean:
		docker rmi $(PROJECT):$(TAG)
