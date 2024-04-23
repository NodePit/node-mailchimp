# Mailchimp Node.js Library

[![npm version](https://badge.fury.io/js/%40nodepit%2Fmailchimp.svg)](https://badge.fury.io/js/%40nodepit%2Fmailchimp)

## ⚠️ Deprecation note

We no longer use Mailchimp, and so we will no longer maintain this module.

The [Mailchimp API](http://apidocs.mailchimp.com) allows you to sync email activity and campaign stats with your database, manage lists/audiences, view and control automation workflows, and test calls and endpoints before pushing to production.

This Node.js library provides a simple wrapper implementation for the [Mailchimp API](http://apidocs.mailchimp.com) that currently supports basic functionality around creating, editing and deleting members.

## Installation

```shell
$ yarn add @nodepit/mailchimp
```

## Usage

```javascript
import { Mailchimp } from '@nodepit/mailchimp';

const yourApiKey = 'Your Mailchimp API key';
const yourListId = 'Your Mailchimp list id';

const mailChimp = new Mailchimp(yourApiKey);
await mailChimp.createMember(yourListId, 'mail@example.com', {
  status: MemberStatus.SUBSCRIBED,
  merge_fields: { FNAME: 'Daniel' },
  // more parameters
});
```

## Development

Install NPM dependencies with `yarn`.

To execute the tests, run the `test` task.

For the best development experience, make sure that your editor supports [ESLint](https://eslint.org/docs/user-guide/integrations), [markdownlint](https://github.com/DavidAnson/markdownlint) and [EditorConfig](http://editorconfig.org).

## Releasing to NPM

Commit all changes and run the following:

```shell
$ npm login
$ npm version <update_type>
$ npm publish --access public
```

… where `<update_type>` is one of `patch`, `minor`, or `major`. This will update the `package.json`, and create a tagged Git commit with the version number.

## Contributing

Pull requests are very welcome. Feel free to discuss bugs or new features by opening a new [issue](https://github.com/NodePit/node-mailchimp/issues).

- - -

Copyright [nodepit.com](https://nodepit.com), 2018 – 2022.
