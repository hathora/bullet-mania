import { AuthV1Api, AuthV1ApiInterface, Configuration } from "@hathora/hathora-cloud-sdk";

export class AuthClient {
  private client: AuthV1ApiInterface;
  private appId: string;

  constructor(appId: string) {
    this.client = new AuthV1Api(new Configuration());
    this.appId = appId;
  }

  async loginAnonymous(): Promise<string> {
    const res = await this.client.loginAnonymous(this.appId);
    return res.token;
  }

  async loginNickname(nickname: string): Promise<string> {
    const res = await this.client.loginNickname(this.appId, { nickname });
    return res.token;
  }

  async loginGoogle(idToken: string): Promise<string> {
    const res = await this.client.loginGoogle(this.appId, { idToken });
    return res.token;
  }
}
