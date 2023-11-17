DOCKER_BUILD := @DOCKER_BUILDKIT=1 docker build

NOCOLOR := \033[0m
GREEN   := \033[0;32m
PRE_COLOR := \n$(GREEN)
POST_COLOR := $(NOCOLOR)\n


build:
	$(DOCKER_BUILD) \
	--target runner \
	-t vision-show:latest \
	-f Dockerfile .

port:
	@echo "Starting at port: ${PRE_COLOR} http://127.0.0.1:3000/ ${POST_COLOR}"

dcup: port
	docker-compose -f docker-compose.run.yml up

dcdown:
	docker-compose -f docker-compose.run.yml down --remove-orphans

start: build dcup
stop: dcdown

