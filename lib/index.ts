import * as crypto from 'crypto';
import request from 'superagent';

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

export class Mailchimp {

  private authToken: string;
  private baseUrl: string;

  constructor (apiKey: string, dataCenter?: string) {
    if (!apiKey) throw new Error('Mailchimp API key required');
    dataCenter = dataCenter || Mailchimp.getDataCenter(apiKey);
    if (!dataCenter) throw new Error('Mailchimp data center required');
    this.authToken = Buffer.from(`any:${apiKey}`).toString('base64');
    this.baseUrl = `https://${dataCenter}.api.mailchimp.com/3.0`;
  }

  private static getDataCenter (apiKey: string): string | undefined {
    const dc = apiKey.substring(apiKey.indexOf('-') + 1);
    return (dc !== apiKey) ? dc : undefined;
  }

  private static getEmailHash (email: string): string {
    return crypto.createHash('md5').update(email).digest('hex');
  }

  createMember (listId: string, email: string, details?: MemberDetails): Promise<any> {
    const path = `/lists/${listId}/members`;
    const body = {
      email_address: email,
      status: MemberStatus.SUBSCRIBED,
      ...details
    };
    return this.sendRequest('POST', path, body);
  }

  editMember (listId: string, email: string, details?: MemberDetails): Promise<any> {
    const emailHash = Mailchimp.getEmailHash(email);
    const path = `/lists/${listId}/members/${emailHash}`;
    const body = {
      email_address: email,
      ...details
    };
    return this.sendRequest('PATCH', path, body);
  }

  deleteMember (listId: string, email: string): Promise<any> {
    const emailHash = Mailchimp.getEmailHash(email);
    const path = `/lists/${listId}/members/${emailHash}`;
    return this.sendRequest('DELETE', path);
  }

  private sendRequest (method: string, path: string, body?: any): Promise<any> {
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
