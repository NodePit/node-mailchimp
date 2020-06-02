import nock from 'nock';
import { Mailchimp } from '../lib/index';

describe('Mailchimp', () => {
  describe('initialization', () => {
    it('can be initialized with api key with included data center', () => {
      const mailChimp = new Mailchimp('mySecretApiKey-us19');
      expect(mailChimp).toBeInstanceOf(Object);
    });

    it('can be initialized with api key and data center', () => {
      const mailChimp = new Mailchimp('mySecretApiKey', 'us-19');
      expect(mailChimp).toBeInstanceOf(Object);
    });

    it('fails when no api key is provided', () => {
      const fn = (): Mailchimp => new Mailchimp('');
      expect(fn).toThrowError();
    });

    it('fails when data center is not provided and can not be extracted', () => {
      const fn = (): Mailchimp => new Mailchimp('mySecretApiKey');
      expect(fn).toThrowError();
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

    describe('creates members', () => {
      it('sends basic auth headers', () => {
        const expectation = api.post('/lists/myList/members').basicAuth(auth).reply(200);
        return mailchimp.createMember('myList', 'test@test.de').then(() => expectation.done());
      });

      it('resolves with response body', () => {
        const resultBody = { message: 'Body' };
        const expectation = api.post('/lists/myList/members').basicAuth(auth).reply(200, resultBody);
        return mailchimp.createMember('myList', 'test@test.de').then(res => {
          expect(res).toEqual(resultBody);
          expectation.done();
        });
      });

      it('rejects with error message', () => {
        const expectation = api.post('/lists/myList/members').basicAuth(auth).reply(400);
        return mailchimp.createMember('myList', 'test@test.de').catch(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err).toHaveProperty('status', 400);
          expectation.done();
        });
      });
    });

    describe('edits members', () => {
      const hash = 'f84d37ce99493155ee296c2b746191d0';

      it('sends basic auth headers', () => {
        const expectation = api.patch(`/lists/myList/members/${hash}`).basicAuth(auth).reply(200);
        return mailchimp.editMember('myList', 'test@test.de').then(() => expectation.done());
      });

      it('resolves with response body', () => {
        const resultBody = { message: 'Body' };
        const expectation = api.patch(`/lists/myList/members/${hash}`).basicAuth(auth).reply(200, resultBody);
        return mailchimp.editMember('myList', 'test@test.de').then(res => {
          expect(res).toEqual(resultBody);
          expectation.done();
        });
      });

      it('rejects with error message', () => {
        const expectation = api.patch(`/lists/myList/members/${hash}`).basicAuth(auth).reply(400);
        return mailchimp.editMember('myList', 'test@test.de').catch(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err).toHaveProperty('status', 400);
          expectation.done();
        });
      });
    });

    describe('deletes members', () => {
      const hash = 'f84d37ce99493155ee296c2b746191d0';

      it('sends basic auth headers', () => {
        const expectation = api.delete(`/lists/myList/members/${hash}`).basicAuth(auth).reply(200);
        return mailchimp.deleteMember('myList', 'test@test.de').then(() => expectation.done());
      });

      it('resolves with response body', () => {
        const expectation = api.delete(`/lists/myList/members/${hash}`).basicAuth(auth).reply(200);
        return mailchimp.deleteMember('myList', 'test@test.de').then(() => expectation.done());
      });

      it('rejects with error message', () => {
        const expectation = api.delete(`/lists/myList/members/${hash}`).basicAuth(auth).reply(400);
        return mailchimp.deleteMember('myList', 'test@test.de').catch(err => {
          expect(err).toBeInstanceOf(Error);
          expect(err).toHaveProperty('status', 400);
          expectation.done();
        });
      });
    });
  });
});
