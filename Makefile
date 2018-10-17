SHELL = /bin/bash -O extglob -c

.PHONY:

PUBLISH_BRANCH=develop
CURRENT_GIT_BRANCH:=$(shell git symbolic-ref --short HEAD)
CURRENT_GIT_TAGS:=$(shell git tag -l --points-at HEAD)
# MERGE_RELEASE:=$(shell git merge --no-ff release --no-edit)

publish:
ifneq ("$(CURRENT_GIT_BRANCH)", "$(PUBLISH_BRANCH)")
	@echo "Invalid branch to start public. Branch to start: 'develop'"
	exit 3
else
	@echo "Current branch is '$(PUBLISH_BRANCH)'. OK for publishing. Continue..."
endif

	# create release and publish packages
	git checkout -b release
	git push origin release

	npx lerna publish

ifeq ($(CURRENT_GIT_TAGS),)
	@echo "No packages were published. Abort"
	$(MAKE) cleanup
	exit 4
endif

	git push origin release

	# merge with develop
	git checkout develop
	git merge --no-ff release --no-edit

	# merge with master
	git checkout master
	git merge --no-ff release --no-edit

	# push main branches
	git push origin develop
	git push origin master

	$(MAKE) cleanup

	@echo "Success!"

cleanup: ## remove release branch
	git checkout develop

	git branch -D release
	git branch -rD origin/release
