import 'dotenv/config';

/** Centralised, typed access to environment configuration. */
export class Env {
  static readonly uiBaseUrl = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
  static readonly apiBaseUrl = process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';
  static readonly workbenchBaseUrl =
    process.env.WORKBENCH_BASE_URL ?? 'https://uat.vitalitydrive.com/vitality-drive-workbench/';

  static get uiUser(): string {
    return process.env.UI_USER ?? 'standard_user';
  }

  static get uiPassword(): string {
    return process.env.UI_PASSWORD ?? 'secret_sauce';
  }

  static get workbenchUser(): string {
    return Env.required('WORKBENCH_USER');
  }

  static get workbenchPassword(): string {
    return Env.required('WORKBENCH_PASSWORD');
  }

  /** Read lazily so suites that don't need a variable don't fail without it. */
  private static required(name: string): string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required environment variable ${name} (see .env.example)`);
    return value;
  }
}
