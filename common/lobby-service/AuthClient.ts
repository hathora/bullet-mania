import { postJson } from "./util";

export class AuthClient {
  protected authEndpoint: string;

  constructor(appId: string) {
    const endpoint = process.env.HATHORA_API_HOST ?? "https://api.hathora.dev";
    this.authEndpoint = `${endpoint}/auth/v1/${appId}`;
  }

  async loginAnonymousV1(): Promise<string> {
    const res = await postJson(`${this.authEndpoint}/login/anonymous`, {});
    return res.token;
  }

  async loginNicknameV1(nickname: string): Promise<string> {
    const res = await postJson(`${this.authEndpoint}/login/nickname`, {
      nickname,
    });
    return res.token;
  }

  async loginGoogle(idToken: string): Promise<string> {
    const res = await postJson(`${this.authEndpoint}/login/google`, {
      idToken,
    });
    return res.token;
  }
}
