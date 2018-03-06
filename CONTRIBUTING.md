# Contributing to Okta Open Source Repos

Thank you for your interest in contributing to Okta's Open Source Projects! Before submitting a PR, please take a moment to read over our [Contributer License Agreement](https://developer.okta.com/cla/). In certain cases, we ask that you [sign a CLA](https://developer.okta.com/sites/all/themes/developer/pdf/okta_individual_contributor_license_agreement_2016-11.pdf) before we merge your pull request.

## Style

### Git Commit Messages

We use a simplified form of [Atom's](https://github.com/atom/atom/blob/master/CONTRIBUTING.md#git-commit-messages) commit convention.

  * Use the present tense ("Adds feature" not "Added feature")
  * Limit the first line to 72 characters or less
  * Add one feature per commit. If you have multiple features, have multiple commits.

#### Template

    <emoji> Short Description of Commit
    <BLANKLINE>
    More detailed description of commit
    <BLANKLINE>
    Resolves: <Jira # or Issue #>

#### Emoji Categories
Our categories include:
  * :seedling: `:seedling:` when creating a new feature
  * :bug: `:bug:` when fixing a bug
  * :white_check_mark: `:white_check_mark:` when adding tests
  * :art: `:art:` when improving the format/structure of the code
  * :memo: `:memo:` when writing docs
  * :fire: `:fire:` when removing code or files
  * :package: `:package:` when pushing a new release
  * :arrow_up: `:arrow_up:` when upgrading dependencies, or generating files
  * :arrow_down: `:arrow_down:` when downgrading dependencies

If you do not see an exact emoji match, use the best matching emoji.

#### Example
    :memo: Updates CONTRIBUTING.md

    Updates Contributing.md with new emoji categories
    Updates Contributing.md with new template

    Resolves: #1234


## Running Tests locally

You can run tests is each individual package by navigating to the package and running `npm test`.
E.g:

```bash
# At project root
cd packages/oidc-middleware
npm install
npm test
```

You can also run all the tests inside each of the packages from the project root.

For that, you will need to install the dependencies of each package. This can be performed via the following commands:

```bash
# At project root
npm install
npm run bootstrap
```

> **Note:** Since the packages contain libraries for both Single-Page applications and Web Applications, you will need to create an SPA and Web App in your okta org.
>
> For the SPA, set the following login redirect URIs - `http://localhost:8080/implicit/callback` & `http://localhost:3000/implicit/callback`
>
> For the Web App, set the following login redirect URI - `http://localhost:8080/authorization-code/callback`

Next, setup the following environment variables:

```bash
export ISSUER=https://{your-okta-org-url}/oauth2/default
export SPA_CLIENT_ID={yourSPAClientId}
export WEB_CLIENT_ID={yourWebAppClientId}
export CLIENT_SECRET={yourWebAppClientSecret}
export USERNAME={yourOktaOrgLoginName}
export PASSWORD={yourOktaOrgLoginPassword}
```

After setting up the environment variables, run the following command to run all tests in the packages

```bash
npm test
```
