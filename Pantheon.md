# Pantheon

## Table of Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Setup](#setup)
- [Supported variables](#supported-variables)
- [Things you should know](#things-you-should-know)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Setup

1. Create GitLab repository (both gitlab.xfive.co and gitlab.com should work)
2. Create Site on Pantheon. If you are member of Xfive organization please use `Chisel Test` upstream.
3. Now the boring part, you have to configure environment variables that will be used during deployments. You can do that by going to `Settings -> CI/CD -> Secret variables` in GitLab project. I also created [node script](https://github.com/jakub300/pantheon-ci-variables) that can set them for you. It is useful if you are going to create multiple projects with the same variables. Look below for the variables list.
4. Clone GitLab repository locally.
5. Generate project using Chisel from relevant branch.
6. ❗️ When commiting generated project add `[chisel-force]` to commit message. ❗️
7. After push go to GitLab and select CI/CD. You should see new Pipeline that should deploy website to Pantheon.
8. Now you can play with your project :)

## Supported variables

* `BASE_GIT_URL` - Git URL to GitLab repository (should not be HTTP(S)).
* `CHISEL_BASE_KEY_PRIVATE` - Private key with push access to base repository. On GitLab you can use [Deploy Keys](https://docs.gitlab.com/ce/ssh/README.html#deploy-keys), you don't have to use key with access to all your repositories.
* `CHISEL_PANTHEON_SITE_NAME` - Pantheon site name. When you open development site on Pantheon the URL is `http(s)://dev-{SITE_NAME}.pantheonsite.io/`.
* `PANTHEON_GIT_URL` - Git URL to Pantheon. It is part of `git clone ...` command displayed in Pantheon when your connection mode is Git.
* `CHISEL_PANTHEON_KEY_PRIVATE` - Private key with push access to Pantheon. Unfortunately Pantheon doesn't provide _Deploy Keys_ equivalent so you have to normally add key to your account.
* `TERMINUS_TOKEN` - You can get in on Pantheon: `My Dashboard -> Account -> Machine Tokens`. If this variable is not set Multidev will not work but deployments to dev should still work.
* `CHISEL_PUSHBACK_CONFIG` - JSON with pushback configuration. You can get url and token by creating Pipeline trigger in your GitLab project: `Settings -> CI/CD -> Pipeline triggers`. If this is not set, when commit is made using Pantheon Dashboard we will not attept to move it to base repository immediatelly. Evrything else should still work.
  ```json
  {
    "url": "...",
    "method": "POST",
    "postData": {
      "ref": "{GIT.branch}",
      "token": "..."
    }
  }
  ``` 

## Things you should know

* Multidev should work. In other words, when you create the branch `hello` in your repository and push it to GitLab, the website based on that branch shoyld appear under `http(s)://hello-{SITE_NAME}.pantheonsite.io/`. When you remove the branch in the base repository the relevant multidev should be removed too.
* When you switch Pantheon to SFTP mode, make some changes and commit them we will attept to move those changes to our repository. Right now that will suceed only if you switch to Git mode immediatelly (really immediatelly!) after commiting. That is requirement because we always do build after merging changes and we will not ber able to push that build if Pantheon site is still in SFTP mode.
* You should not do things like creating Multidev or merging Multidev to dev using Pantheon Dashboard.
* When Upstream changes (like WP update) are done using Pantheon Dashboard there is no hook we can use to detect that fact so to do that merge on our Base branch you can run pipeline manually (`CI/CD -> Run Pipeline`) or it will be done automatically after next comit to base repository.
