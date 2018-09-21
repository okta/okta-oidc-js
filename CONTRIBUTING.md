# Contributing to Okta Open Source Repos

Thank you for your interest in contributing to Okta's Open Source Projects! Before submitting a PR, please take a moment to read over our [Contributer License Agreement](https://developer.okta.com/cla/). In certain cases, we ask that you [sign a CLA](https://developer.okta.com/sites/all/themes/developer/pdf/okta_individual_contributor_license_agreement_2016-11.pdf) before we merge your pull request.

- [Commit Message Guidelines](#commit)
- [Running Tests locally](#running_tests)

## <a name="commit"></a> Commit Message Guidelines

### Git Commit Messages

We use an adapted form of [Conventional Commits](http://conventionalcommits.org/).

* Use the present tense ("Adds feature" not "Added feature")
* Limit the first line to 72 characters or less
* Add one feature per commit. If you have multiple features, have multiple commits.

### Template

    <type>: Short Description of Commit
    <BLANKLINE>
    (Optional) More detailed description of commit
    <BLANKLINE>
    (Optional) Resolves: <Jira # or Issue #>

### Template for specific package change

    <type>[<package-name>]: Short Description of Commit
    <BLANKLINE>
    (Optional) More detailed description of commit
    <BLANKLINE>
    (Optional) Resolves: <Jira # or Issue #>

### Type
Our types include:
  * `feat` when creating a new feature
  * `fix` when fixing a bug
  * `test` when adding tests
  * `refactor` when improving the format/structure of the code
  * `docs` when writing docs
  * `release` when pushing a new release
  * `chore` others (ex: upgrading/downgrading dependencies)


### Example

    docs: Updates CONTRIBUTING.md

    Updates Contributing.md with new emoji categories
    Updates Contributing.md with new template

    Resolves: #1234

### Example for specific package change
    fix[okta-angular]: Fixes bad bug

    Fixes a very bad bug in okta-angular

    Resolves: #5678

### Breaking changes

  * Breaking changes MUST be indicated at the very beginning of the body section of a commit. A breaking change MUST consist of the uppercase text `BREAKING CHANGE`, followed by a colon and a space.
  * A description MUST be provided after the `BREAKING CHANGE:`, describing what has changed about the API.

### Example for a breaking change

    feat: Allows provided config object to extend other configs

    BREAKING CHANGE: `extends` key in config file is now used for extending other config files
