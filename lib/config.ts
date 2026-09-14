export interface EmailConfig {
  provider: "smtp" | "resend" | "ses";
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  fromAddress: string;
  fromName: string;
  enabled: boolean;
}

export interface WhatsAppConfig {
  provider: "meta_cloud" | "twilio";
  senderPhone: string;
  accountSid: string;
  enabled: boolean;
}

export interface TelegramConfig {
  botToken: string;
  defaultChatId: string;
  alertsChannel: string;
  enabled: boolean;
}

export interface BrandingConfig {
  siteTitle: string;
  tagline: string;
  organizationName: string;
  logoUrl: string;
  headColor: string;
  fontFamily: string;
  monoFontFamily: string;
  fontSizeBase: string;
}

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogImage: string;
  canonicalUrl: string;
}

export interface SystemConfig {
  timezone: string;
  locale: string;
  branding: BrandingConfig;
  seo: SeoConfig;
  email: EmailConfig;
  whatsapp: WhatsAppConfig;
  telegram: TelegramConfig;
}

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  timezone: "Asia/Kolkata", // Default: India Standard Time (IST, GMT+5:30)
  locale: "en-IN",
  branding: {
    siteTitle: "DOS Club TalentOS",
    tagline: "Student Growth. Learning Evidence. Talent Intelligence.",
    organizationName: "DeScience Open Source Club",
    logoUrl: "/dos-club-logo.png",
    headColor: "#0f172a",
    fontFamily: "Inter, sans-serif",
    monoFontFamily: "JetBrains Mono, monospace",
    fontSizeBase: "16px",
  },
  seo: {
    metaTitle: "DOS Club TalentOS — Student Growth & Talent Intelligence",
    metaDescription:
      "Operating platform for Descience Open Source Club tracking 27 workshops and learning evidence across Tamil Nadu and global partner institutions.",
    metaKeywords:
      "DOS Club, TalentOS, Engineering Portfolio, Student Growth, Talent Intelligence, Anna University, Tamil Nadu",
    ogImage: "/og-image.png",
    canonicalUrl: "http://localhost:3000",
  },
  email: {
    provider: "smtp",
    smtpHost: "smtp.sendgrid.net",
    smtpPort: 587,
    smtpUser: "apikey",
    fromAddress: "notifications@dosclub.org",
    fromName: "DOS Club TalentOS",
    enabled: true,
  },
  whatsapp: {
    provider: "meta_cloud",
    senderPhone: "+914422350000",
    accountSid: "AC_meta_cloud_dosclub_india",
    enabled: true,
  },
  telegram: {
    botToken: "bot_dosclub_talentos_token",
    defaultChatId: "-1002345678901",
    alertsChannel: "@dosclub_engineering_alerts",
    enabled: true,
  },
};

// In-memory runtime cache with disk/DB fallback
let runtimeConfig: SystemConfig = { ...DEFAULT_SYSTEM_CONFIG };

export function getSystemConfig(): SystemConfig {
  return runtimeConfig;
}

export function updateSystemConfig(partial: Partial<SystemConfig>): SystemConfig {
  runtimeConfig = {
    ...runtimeConfig,
    ...partial,
    branding: { ...runtimeConfig.branding, ...(partial.branding || {}) },
    seo: { ...runtimeConfig.seo, ...(partial.seo || {}) },
    email: { ...runtimeConfig.email, ...(partial.email || {}) },
    whatsapp: { ...runtimeConfig.whatsapp, ...(partial.whatsapp || {}) },
    telegram: { ...runtimeConfig.telegram, ...(partial.telegram || {}) },
  };
  return runtimeConfig;
}
