import * as crypto from 'crypto';
import request from 'superagent';
import querystring from 'querystring';

export interface MemberDetails {
  email_address?: string;
  status?: MemberStatus;
  merge_fields?: any;
  [x: string]: any;
}

export enum MemberStatus {
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBED = 'unsubscribed',
  CLEANED = 'cleaned',
  PENDING = 'pending'
}

export type PagingParams = {
  count?: number;
  offset?: number;
};

export class Mailchimp {
  private authToken: string;
  private baseUrl: string;

  constructor(apiKey: string, dataCenter?: string) {
    if (!apiKey) throw new Error('Mailchimp API key required');
    dataCenter = dataCenter || Mailchimp.getDataCenter(apiKey);
    if (!dataCenter) throw new Error('Mailchimp data center required');
    this.authToken = Buffer.from(`any:${apiKey}`).toString('base64');
    this.baseUrl = `https://${dataCenter}.api.mailchimp.com/3.0`;
  }

  private static getDataCenter(apiKey: string): string | undefined {
    const dc = apiKey.substring(apiKey.indexOf('-') + 1);
    return dc !== apiKey ? dc : undefined;
  }

  private static getEmailHash(email: string): string {
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  createMember(listId: string, email: string, details?: MemberDetails): Promise<any> {
    const path = `/lists/${listId}/members`;
    const body: MemberDetails = {
      email_address: email,
      status: MemberStatus.SUBSCRIBED,
      ...details
    };
    return this.sendRequest('POST', path, body);
  }

  editMember(listId: string, email: string, details?: MemberDetails): Promise<any> {
    const emailHash = Mailchimp.getEmailHash(email);
    const path = `/lists/${listId}/members/${emailHash}`;
    const body: MemberDetails = {
      email_address: email,
      ...details
    };
    return this.sendRequest('PATCH', path, body);
  }

  deleteMember(listId: string, email: string): Promise<any> {
    const emailHash = Mailchimp.getEmailHash(email);
    const path = `/lists/${listId}/members/${emailHash}`;
    return this.sendRequest('DELETE', path);
  }

  /** https://mailchimp.com/developer/marketing/api/list-members/list-members-info/ */
  getMembers(listId: string, options: PagingParams = {}): Promise<any> {
    const query = querystring.stringify(options);
    const path = `/lists/${listId}/members?${query}`;
    return this.sendRequest('GET', path);
  }

  /** https://mailchimp.com/developer/marketing/api/lists/get-lists-info/ */
  getLists(options: PagingParams = {}): Promise<any> {
    const query = querystring.stringify(options);
    return this.sendRequest('GET', `/lists?${query}`);
  }

  private sendRequest(method: string, path: string, body?: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      request(method, `${this.baseUrl}${path}`)
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + this.authToken)
        .send(body)
        .end((err, res) => {
          if (err) reject(err);
          resolve(res.body || {});
        });
    });
  }
}
