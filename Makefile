SHELL = /bin/bash -O extglob -c

PUBLISH_BRANCH=develop
CURRENT_GIT_BRANCH:=$(shell git symbolic-ref --short HEAD)
CURRENT_GIT_TAGS:=$(shell git tag -l --points-at HEAD)

.DEFAULT_GOAL: help
.PHONY: publish cleanup assert_version_bump

help: ## Shows 'help' description for available targets.
	@IFS=$$'\n' ; \
    help_lines=(`fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//'`); \
    for help_line in $${help_lines[@]}; do \
        IFS=$$'#' ; \
        help_split=($$help_line) ; \
        help_command=`echo $${help_split[0]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
        help_info=`echo $${help_split[2]} | sed -e 's/^ *//' -e 's/ *$$//'` ; \
        printf "\033[36m%-30s\033[0m %s\n" $$help_command $$help_info ; \
    done

publish: ## Publishes a new version of packages with 'lerna publish'
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

	$(MAKE) assert_version_bump

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

cleanup: ## Removes release branch
	git checkout develop

	git branch -D release
	git branch -rD origin/release
	git push origin :release

assert_version_bump: ## Checks if no interruptions were made and packages have their new version tags
ifeq (${CURRENT_GIT_TAGS},)
	@echo "No packages were published. Abort"
	$(MAKE) cleanup
	exit 4
endif
