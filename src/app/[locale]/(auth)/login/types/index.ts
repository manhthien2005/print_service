export interface LoginFormProps {
  locale: string;
  copy: {
    title: string;
    subtitle: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    login: string;
    captchaTitle: string;
    captchaError: string;
    captchaRequired: string;
  };
}
