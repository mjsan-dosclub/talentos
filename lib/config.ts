export interface EmailConfig {
  provider: "smtp" | "resend" | "ses";
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass?: string;
  resendApiKey?: string;
  fromAddress: string;
  fromName: string;
  globalCc?: string;
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
    provider: (process.env.EMAIL_PROVIDER as any) || "smtp",
    smtpHost: process.env.SMTP_HOST || "smtp.sendgrid.net",
    smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
    smtpUser: process.env.SMTP_USER || "apikey",
    smtpPass: process.env.SMTP_PASS || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
    fromAddress: process.env.EMAIL_FROM || "notifications@dosclub.org",
    fromName: "DOS Club TalentOS",
    globalCc: process.env.EMAIL_GLOBAL_CC || "descienceosclub@gmail.com",
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

// Disk persistence helpers for server-side runtime
function loadFromDisk(): SystemConfig | null {
  if (typeof window !== "undefined") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const filePath = path.join(process.cwd(), "data", "system_settings.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SYSTEM_CONFIG,
        ...parsed,
        branding: { ...DEFAULT_SYSTEM_CONFIG.branding, ...(parsed.branding || {}) },
        seo: { ...DEFAULT_SYSTEM_CONFIG.seo, ...(parsed.seo || {}) },
        email: { ...DEFAULT_SYSTEM_CONFIG.email, ...(parsed.email || {}) },
        whatsapp: { ...DEFAULT_SYSTEM_CONFIG.whatsapp, ...(parsed.whatsapp || {}) },
        telegram: { ...DEFAULT_SYSTEM_CONFIG.telegram, ...(parsed.telegram || {}) },
      };
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

function saveToDisk(cfg: SystemConfig): void {
  if (typeof window !== "undefined") return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "system_settings.json");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(cfg, null, 2), "utf-8");
  } catch {
    // Graceful fallback
  }
}

// In-memory runtime cache with disk/DB fallback
let runtimeConfig: SystemConfig = loadFromDisk() || { ...DEFAULT_SYSTEM_CONFIG };

export function getSystemConfig(): SystemConfig {
  const diskConfig = loadFromDisk();
  if (diskConfig) {
    runtimeConfig = diskConfig;
  }
  return runtimeConfig;
}

export function updateSystemConfig(partial: Partial<SystemConfig>): SystemConfig {
  const current = getSystemConfig();
  runtimeConfig = {
    ...current,
    ...partial,
    branding: { ...current.branding, ...(partial.branding || {}) },
    seo: { ...current.seo, ...(partial.seo || {}) },
    email: { ...current.email, ...(partial.email || {}) },
    whatsapp: { ...current.whatsapp, ...(partial.whatsapp || {}) },
    telegram: { ...current.telegram, ...(partial.telegram || {}) },
  };
  saveToDisk(runtimeConfig);
  return runtimeConfig;
}
