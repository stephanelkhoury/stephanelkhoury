'use client';

import Image from 'next/image';
import { createContext, useContext, useSyncExternalStore } from 'react';

export type Lang = 'en' | 'ar';

const LangContext = createContext<{ lang: Lang; t: (key: keyof typeof dict.en) => string }>({ lang: 'en', t: key => dict.en[key] });
export const useAuthText = () => useContext(LangContext);

const dict = {
  en: {
    title: 'Sign in', subtitle: 'Your company workspace for agents, projects and delivery.',
    email: 'Email', password: 'Password', code: 'Authentication code', codeHelp: 'Enter the 6-digit code from your authenticator app.',
    signIn: 'Sign in', signingIn: 'Signing in…', forgot: 'Forgot your password?', back: 'Back to sign in',
    forgotTitle: 'Reset your password', forgotText: 'Enter your email and we will send a reset link if the account exists.', send: 'Send reset link', sent: 'If that account exists, a reset link is on its way. If email is not set up yet, ask the owner for a reset link.',
    resetTitle: 'Choose a new password', newPassword: 'New password', confirm: 'Confirm password', save: 'Save password', saved: 'Password saved. You can sign in now.', mismatch: 'The two passwords do not match.',
    hint: 'At least 10 characters with letters and a number.', language: 'العربية', noToken: 'This link is missing its token. Open the link from your email again.',
  },
  ar: {
    title: 'تسجيل الدخول', subtitle: 'مساحة عمل شركتك للوكلاء والمشاريع والتسليم.',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', code: 'رمز المصادقة', codeHelp: 'أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة.',
    signIn: 'تسجيل الدخول', signingIn: 'جارٍ تسجيل الدخول…', forgot: 'هل نسيت كلمة المرور؟', back: 'العودة إلى تسجيل الدخول',
    forgotTitle: 'إعادة تعيين كلمة المرور', forgotText: 'أدخل بريدك الإلكتروني وسنرسل رابط إعادة التعيين إذا كان الحساب موجودًا.', send: 'إرسال رابط إعادة التعيين', sent: 'إذا كان الحساب موجودًا فسيصلك رابط إعادة التعيين. إذا لم يُفعَّل البريد بعد، اطلب الرابط من المالك.',
    resetTitle: 'اختر كلمة مرور جديدة', newPassword: 'كلمة المرور الجديدة', confirm: 'تأكيد كلمة المرور', save: 'حفظ كلمة المرور', saved: 'تم حفظ كلمة المرور. يمكنك تسجيل الدخول الآن.', mismatch: 'كلمتا المرور غير متطابقتين.',
    hint: '10 أحرف على الأقل مع حروف ورقم.', language: 'English', noToken: 'الرابط لا يحتوي على الرمز. افتح الرابط من بريدك مرة أخرى.',
  },
} as const;

function subscribeLang(notify: () => void) {
  window.addEventListener('auth-lang', notify);
  window.addEventListener('storage', notify);
  return () => { window.removeEventListener('auth-lang', notify); window.removeEventListener('storage', notify); };
}

export default function AuthShell({ heading, children }: { heading: (t: ReturnType<typeof useAuthText>['t']) => string; children: React.ReactNode }) {
  const lang = useSyncExternalStore<Lang>(subscribeLang, () => (window.localStorage.getItem('auth-lang') === 'ar' ? 'ar' : 'en'), () => 'en');
  const t = (key: keyof typeof dict.en) => dict[lang][key];
  const toggle = () => { window.localStorage.setItem('auth-lang', lang === 'en' ? 'ar' : 'en'); window.dispatchEvent(new Event('auth-lang')); };

  return (
    <LangContext.Provider value={{ lang, t }}>
      <main dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} className="auth-page">
        <div className="auth-card">
          <header className="auth-head">
            <Image src="/brand/multigraphic-logo.png" alt="multigraphic.lb" width={900} height={212} priority className="auth-logo" />
            <button type="button" onClick={toggle} className="auth-lang">{t('language')}</button>
          </header>
          <h1>{heading(t)}</h1>
          <p className="auth-sub">{t('subtitle')}</p>
          {children}
        </div>
        <style>{`
          .auth-page{min-height:100svh;display:grid;place-items:center;padding:24px;background:radial-gradient(1100px 500px at 15% -10%,#e6eefb 0,transparent 60%),radial-gradient(900px 480px at 100% 110%,#efe6fb 0,transparent 60%),#f7f5f0;color:#1b1f2a;font-family:Arial,Helvetica,sans-serif}
          .auth-card{width:min(440px,100%);background:#fff;border:1px solid #e3dfd6;border-radius:14px;padding:30px;box-shadow:0 18px 50px -24px rgba(26,16,72,.35)}
          .auth-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:22px}
          .auth-logo{width:170px;height:auto}
          .auth-lang{border:1px solid #d9d4c8;background:#fff;color:#3a3f4d;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer}
          .auth-lang:hover{background:#f4f1ea}
          .auth-card h1{margin:0 0 6px;font-size:24px;font-weight:600;letter-spacing:-.01em}
          .auth-sub{margin:0 0 22px;color:#5b6070;font-size:14px;line-height:1.5}
          .auth-field{display:block;margin-bottom:16px}
          .auth-field span{display:block;margin-bottom:6px;font-size:13px;color:#3a3f4d}
          .auth-field input{width:100%;min-height:44px;border:1px solid #cfc9bb;border-radius:8px;padding:0 12px;font-size:15px;background:#fff;color:#1b1f2a}
          .auth-field input:focus{outline:2px solid #5b4bd6;outline-offset:1px;border-color:#5b4bd6}
          .auth-hint{margin:-8px 0 16px;font-size:12px;color:#6a6f7d}
          .auth-button{width:100%;min-height:46px;border:0;border-radius:8px;background:linear-gradient(90deg,#1d8fe0,#6a3fb0);color:#fff;font-size:15px;font-weight:600;cursor:pointer}
          .auth-button:disabled{opacity:.6;cursor:not-allowed}
          .auth-error{margin:0 0 14px;padding:10px 12px;border-radius:8px;background:#fdecec;color:#9b1c1c;font-size:13px}
          .auth-ok{margin:0 0 14px;padding:10px 12px;border-radius:8px;background:#e9f6ec;color:#1b6b34;font-size:13px;line-height:1.5}
          .auth-links{margin-top:16px;text-align:center;font-size:13px}
          .auth-links a{color:#4a3fc0;text-decoration:underline}
          [dir=rtl] .auth-field input{text-align:right}
        `}</style>
      </main>
    </LangContext.Provider>
  );
}
