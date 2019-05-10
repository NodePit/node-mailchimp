import expect = require('expect.js');
import * as nock from 'nock';
import { Mailchimp } from '../lib/index';

describe('Mailchimp', () => {

  describe('is initialized', () => {

    it('with an api key with included data center', () => {
      const mailChimp = new Mailchimp('mySecretApiKey-us19');
      expect(mailChimp).to.be.an('object');
    });

    it('with an api key and data center', () => {
      const mailChimp = new Mailchimp('mySecretApiKey', 'us-19');
      expect(mailChimp).to.be.an('object');
    });

    it('fails when data center is not provided and can not be extracted', () => {
      const fcn = () => new Mailchimp('mySecretApiKey');
      expect(fcn).to.throwError();
    });

  });

  describe('uses api', () => {
    const auth = { user: 'any', pass: 'mySecretApiKey-us19' };
    let api: nock.Scope;
    let mailchimp: Mailchimp;

    beforeEach(() => {
      api = nock('https://us19.api.mailchimp.com/3.0');
      mailchimp = new Mailchimp(auth.pass);
    });

    it('sends basic auth headers', () => {
      const expectation = api
        .post('/lists/myList/members')
        .basicAuth(auth)
        .reply(200);
      return mailchimp
        .createMember('myList', 'test@test.de')
        .then(() => expectation.done());
    });

    it('resolved with response body', () => {
      const resultBody = { message: 'Body' };
      const expectation = api
        .post('/lists/myList/members')
        .basicAuth(auth)
        .reply(200, resultBody);
      return mailchimp
        .createMember('myList', 'test@test.de')
        .then((res) => {
          expect(res).to.be.eql(resultBody);
          expectation.done();
        });
    });

    it('rejects with error message', () => {
      const expectation = api
        .post('/lists/myList/members')
        .basicAuth(auth)
        .reply(400);
      return mailchimp
        .createMember('myList', 'test@test.de')
        .catch((err) => {
          expect(err).to.match(/Mailchimp Error: 400/);
          expectation.done();
        });

    });

  });

});
