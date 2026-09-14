"use client";

import React, { useState, useEffect } from "react";
import { DEFAULT_LANDING_CMS, LandingCmsData } from "@/lib/cms-defaults";

import {
  FileTextIcon,
  CheckIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
} from "@/components/Icons";

interface LandingCmsTabProps {
  onToast: (message: string) => void;
}

export default function LandingCmsTab({ onToast }: LandingCmsTabProps) {
  const [cms, setCms] = useState<LandingCmsData>(DEFAULT_LANDING_CMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<
    "hero" | "invisibleEngine" | "lounge" | "passport" | "industry" | "honour" | "enquiry"
  >("hero");

  useEffect(() => {
    async function loadCms() {
      setLoading(true);
      try {
        const res = await fetch("/api/cms/landing");
        if (res.ok) {
          const data = await res.json();
          if (data.cms) {
            setCms(data.cms);
          }
        }
      } catch {
        onToast("Failed to fetch landing CMS data from server.");
      } finally {
        setLoading(false);
      }
    }
    loadCms();
  }, [onToast]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/cms/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cms),
      });
      if (res.ok) {
        onToast("Landing page content published successfully!");
      } else {
        onToast("Failed to save landing page changes.");
      }
    } catch {
      onToast("Network error while updating landing page.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset all landing page sections to default DOS Club brand template?")) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/cms/landing", { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        if (data.cms) setCms(data.cms);
        onToast("Reset landing page to default template.");
      } else {
        onToast("Failed to reset CMS content.");
      }
    } catch {
      onToast("Network error while resetting CMS.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-500">
        LOADING_LANDING_CMS_STATE...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Landing Page Content Management
            </h1>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-semibold border border-blue-200">
              CMS V1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Update headlines, narrative copy, call-to-actions, and student photos across all 7 landing page sections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5"
          >
            <span>Preview Landing Page</span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-md transition-colors"
          >
            Reset to Default
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-gradient-to-r from-[#4caf50] to-[#2f8a36] hover:brightness-110 disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckIcon className="w-4 h-4" />
            <span>{saving ? "Publishing..." : "Publish Changes"}</span>
          </button>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
        {[
          { id: "hero", label: "01. Hero & Invitation" },
          { id: "invisibleEngine", label: "02. The Invisible Engine" },
          { id: "lounge", label: "03. The Airport Lounge" },
          { id: "passport", label: "04. Student Passport" },
          { id: "industry", label: "05. Industry Shift" },
          { id: "honour", label: "06. Honour & Growth" },
          { id: "enquiry", label: "07. Admissions & Enquiry" },
        ].map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id as any)}
            className={`px-3.5 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
              activeSection === sec.id
                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* Content Form Editor Container */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO                                                           */}
        {/* ========================================================================= */}
        {activeSection === "hero" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Hero Section Content</h3>
              <p className="text-xs text-slate-500">
                Primary greeting, headline manifesto, call-to-action buttons, and featured student imagery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Eyebrow Tag:</label>
                <input
                  type="text"
                  value={cms.hero.eyebrow}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, eyebrow: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#4caf50]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Sub-Attribution Line:</label>
                <input
                  type="text"
                  value={cms.hero.subAttribution}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, subAttribution: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#4caf50]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Main Title:</label>
                <input
                  type="text"
                  value={cms.hero.title}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, title: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#4caf50]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Highlighted Text (Green Accent):</label>
                <input
                  type="text"
                  value={cms.hero.highlight}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, highlight: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#4caf50]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Subtitle / Hook:</label>
              <input
                type="text"
                value={cms.hero.subtitle}
                onChange={(e) =>
                  setCms({ ...cms, hero: { ...cms.hero, subtitle: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#4caf50]"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Detailed Manifesto / Description:</label>
              <textarea
                rows={3}
                value={cms.hero.description}
                onChange={(e) =>
                  setCms({ ...cms, hero: { ...cms.hero, description: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-[#4caf50] resize-none"
              />
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-800">Primary CTA Button</span>
                <input
                  type="text"
                  value={cms.hero.ctaPrimaryText}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, ctaPrimaryText: e.target.value } })
                  }
                  placeholder="Button Label"
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                />
                <input
                  type="text"
                  value={cms.hero.ctaPrimaryUrl}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, ctaPrimaryUrl: e.target.value } })
                  }
                  placeholder="Target URL"
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-bold text-slate-800">Secondary CTA Button</span>
                <input
                  type="text"
                  value={cms.hero.ctaSecondaryText}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, ctaSecondaryText: e.target.value } })
                  }
                  placeholder="Button Label"
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                />
                <input
                  type="text"
                  value={cms.hero.ctaSecondaryUrl}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, ctaSecondaryUrl: e.target.value } })
                  }
                  placeholder="Target URL"
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>
            </div>

            {/* Photos and Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-700">Primary Student Photo URL:</label>
                <input
                  type="text"
                  value={cms.hero.studentPhoto}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, studentPhoto: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
                <input
                  type="text"
                  value={cms.hero.studentPhotoCaption}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, studentPhotoCaption: e.target.value } })
                  }
                  placeholder="Caption"
                  className="border border-slate-300 rounded-lg p-2.5"
                />
                {cms.hero.studentPhoto && (
                  <div className="h-36 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={cms.hero.studentPhoto}
                      alt="Student Preview"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-slate-700">Collaboration Badge Photo URL:</label>
                <input
                  type="text"
                  value={cms.hero.collabPhoto}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, collabPhoto: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
                <input
                  type="text"
                  value={cms.hero.collabPhotoCaption}
                  onChange={(e) =>
                    setCms({ ...cms, hero: { ...cms.hero, collabPhotoCaption: e.target.value } })
                  }
                  placeholder="Caption"
                  className="border border-slate-300 rounded-lg p-2.5"
                />
                {cms.hero.collabPhoto && (
                  <div className="h-36 rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={cms.hero.collabPhoto}
                      alt="Collab Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: THE INVISIBLE ENGINE                                           */}
        {/* ========================================================================= */}
        {activeSection === "invisibleEngine" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">The Invisible Engine Pipeline</h3>
              <p className="text-xs text-slate-500">
                Configure the headline, narrative explanation, and quiet precision lab evaluation banner.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Eyebrow Tag:</label>
                <input
                  type="text"
                  value={cms.invisibleEngine.eyebrow}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      invisibleEngine: { ...cms.invisibleEngine, eyebrow: e.target.value },
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Title:</label>
                <input
                  type="text"
                  value={cms.invisibleEngine.title}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      invisibleEngine: { ...cms.invisibleEngine, title: e.target.value },
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Telemetry Description:</label>
              <textarea
                rows={2}
                value={cms.invisibleEngine.description}
                onChange={(e) =>
                  setCms({
                    ...cms,
                    invisibleEngine: { ...cms.invisibleEngine, description: e.target.value },
                  })
                }
                className="border border-slate-300 rounded-lg p-2.5 resize-none"
              />
            </div>

            {/* Banner Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <span className="font-bold text-slate-800">Quiet Precision Banner</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Banner Tag:</label>
                  <input
                    type="text"
                    value={cms.invisibleEngine.bannerTag}
                    onChange={(e) =>
                      setCms({
                        ...cms,
                        invisibleEngine: { ...cms.invisibleEngine, bannerTag: e.target.value },
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">Banner Photo URL:</label>
                  <input
                    type="text"
                    value={cms.invisibleEngine.bannerPhoto}
                    onChange={(e) =>
                      setCms({
                        ...cms,
                        invisibleEngine: { ...cms.invisibleEngine, bannerPhoto: e.target.value },
                      })
                    }
                    className="border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Banner Title:</label>
                <input
                  type="text"
                  value={cms.invisibleEngine.bannerTitle}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      invisibleEngine: { ...cms.invisibleEngine, bannerTitle: e.target.value },
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Banner Subtitle:</label>
                <textarea
                  rows={2}
                  value={cms.invisibleEngine.bannerSubtitle}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      invisibleEngine: { ...cms.invisibleEngine, bannerSubtitle: e.target.value },
                    })
                  }
                  className="border border-slate-300 rounded-lg p-2 bg-white resize-none"
                />
              </div>

              {cms.invisibleEngine.bannerPhoto && (
                <div className="h-36 rounded-lg overflow-hidden border border-slate-300">
                  <img
                    src={cms.invisibleEngine.bannerPhoto}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: THE AIRPORT LOUNGE                                             */}
        {/* ========================================================================= */}
        {activeSection === "lounge" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">The Lounge Principle</h3>
              <p className="text-xs text-slate-500">
                Emotional positioning: &ldquo;Some students wait for opportunity. DOS Club members prepare before it arrives.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Eyebrow:</label>
                <input
                  type="text"
                  value={cms.lounge.eyebrow}
                  onChange={(e) =>
                    setCms({ ...cms, lounge: { ...cms.lounge, eyebrow: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Title Prefix:</label>
                <input
                  type="text"
                  value={cms.lounge.title}
                  onChange={(e) =>
                    setCms({ ...cms, lounge: { ...cms.lounge, title: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Title Highlight (Green):</label>
              <input
                type="text"
                value={cms.lounge.highlight}
                onChange={(e) =>
                  setCms({ ...cms, lounge: { ...cms.lounge, highlight: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Description:</label>
              <textarea
                rows={2}
                value={cms.lounge.description}
                onChange={(e) =>
                  setCms({ ...cms, lounge: { ...cms.lounge, description: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5 resize-none"
              />
            </div>

            {/* 5 Lounge Pillars */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-800 block">
                The 5 Visual Lounge Pillars
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {cms.lounge.pillars.map((pillar, idx) => (
                  <div key={pillar.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <span className="font-mono text-[10px] text-slate-400 font-bold">
                      PILLAR {idx + 1} // {pillar.tag}
                    </span>
                    <input
                      type="text"
                      value={pillar.title}
                      onChange={(e) => {
                        const copy = [...cms.lounge.pillars];
                        copy[idx].title = e.target.value;
                        setCms({ ...cms, lounge: { ...cms.lounge, pillars: copy } });
                      }}
                      className="border border-slate-300 rounded p-1.5 w-full bg-white font-semibold"
                    />
                    <textarea
                      rows={2}
                      value={pillar.desc}
                      onChange={(e) => {
                        const copy = [...cms.lounge.pillars];
                        copy[idx].desc = e.target.value;
                        setCms({ ...cms, lounge: { ...cms.lounge, pillars: copy } });
                      }}
                      className="border border-slate-300 rounded p-1.5 w-full bg-white text-[11px] resize-none"
                    />
                    <input
                      type="text"
                      value={pillar.image}
                      onChange={(e) => {
                        const copy = [...cms.lounge.pillars];
                        copy[idx].image = e.target.value;
                        setCms({ ...cms, lounge: { ...cms.lounge, pillars: copy } });
                      }}
                      placeholder="Image URL"
                      className="border border-slate-300 rounded p-1.5 w-full bg-white text-[10px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: STUDENT PASSPORT                                               */}
        {/* ========================================================================= */}
        {activeSection === "passport" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Student Passport Concept</h3>
              <p className="text-xs text-slate-500">
                Stamps and cryptographic milestone credentials accumulated by students over time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Eyebrow:</label>
                <input
                  type="text"
                  value={cms.passport.eyebrow}
                  onChange={(e) =>
                    setCms({ ...cms, passport: { ...cms.passport, eyebrow: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Title:</label>
                <input
                  type="text"
                  value={cms.passport.title}
                  onChange={(e) =>
                    setCms({ ...cms, passport: { ...cms.passport, title: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Description:</label>
              <textarea
                rows={2}
                value={cms.passport.description}
                onChange={(e) =>
                  setCms({ ...cms, passport: { ...cms.passport, description: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5 resize-none"
              />
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Closing Quote:</label>
              <input
                type="text"
                value={cms.passport.quote}
                onChange={(e) =>
                  setCms({ ...cms, passport: { ...cms.passport, quote: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: INDUSTRY SHIFT                                                 */}
        {/* ========================================================================= */}
        {activeSection === "industry" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Industry Shift Section</h3>
              <p className="text-xs text-slate-500">
                &ldquo;Industry doesn&apos;t need another résumé. It needs proof.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Eyebrow:</label>
                <input
                  type="text"
                  value={cms.industry.eyebrow}
                  onChange={(e) =>
                    setCms({ ...cms, industry: { ...cms.industry, eyebrow: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Title:</label>
                <input
                  type="text"
                  value={cms.industry.title}
                  onChange={(e) =>
                    setCms({ ...cms, industry: { ...cms.industry, title: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Description:</label>
              <textarea
                rows={2}
                value={cms.industry.description}
                onChange={(e) =>
                  setCms({ ...cms, industry: { ...cms.industry, description: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5 resize-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 6: HONOUR & GROWTH                                                */}
        {/* ========================================================================= */}
        {activeSection === "honour" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Commitment and Honour</h3>
              <p className="text-xs text-slate-500">
                &ldquo;Commitment should be visible. Growth, not grading.&rdquo;
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Eyebrow:</label>
                <input
                  type="text"
                  value={cms.honour.eyebrow}
                  onChange={(e) =>
                    setCms({ ...cms, honour: { ...cms.honour, eyebrow: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Title:</label>
                <input
                  type="text"
                  value={cms.honour.title}
                  onChange={(e) =>
                    setCms({ ...cms, honour: { ...cms.honour, title: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Description:</label>
              <textarea
                rows={2}
                value={cms.honour.description}
                onChange={(e) =>
                  setCms({ ...cms, honour: { ...cms.honour, description: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5 resize-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 7: ADMISSIONS & ENQUIRY                                           */}
        {/* ========================================================================= */}
        {activeSection === "enquiry" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Admissions & Enquiry Section</h3>
              <p className="text-xs text-slate-500">
                Configure the command console callout and lead capture card on the bottom section.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Eyebrow:</label>
                <input
                  type="text"
                  value={cms.enquiry.eyebrow}
                  onChange={(e) =>
                    setCms({ ...cms, enquiry: { ...cms.enquiry, eyebrow: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-semibold text-slate-700">Title:</label>
                <input
                  type="text"
                  value={cms.enquiry.title}
                  onChange={(e) =>
                    setCms({ ...cms, enquiry: { ...cms.enquiry, title: e.target.value } })
                  }
                  className="border border-slate-300 rounded-lg p-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs">
              <label className="font-semibold text-slate-700">Description:</label>
              <textarea
                rows={2}
                value={cms.enquiry.description}
                onChange={(e) =>
                  setCms({ ...cms, enquiry: { ...cms.enquiry, description: e.target.value } })
                }
                className="border border-slate-300 rounded-lg p-2.5 resize-none"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-800">Member Privilege Card Copy</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={cms.enquiry.memberCardTitle}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      enquiry: { ...cms.enquiry, memberCardTitle: e.target.value },
                    })
                  }
                  placeholder="Card Title"
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                />
                <input
                  type="text"
                  value={cms.enquiry.memberCardCtaText}
                  onChange={(e) =>
                    setCms({
                      ...cms,
                      enquiry: { ...cms.enquiry, memberCardCtaText: e.target.value },
                    })
                  }
                  placeholder="Button Text"
                  className="border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>
              <input
                type="text"
                value={cms.enquiry.memberCardCtaUrl}
                onChange={(e) =>
                  setCms({
                    ...cms,
                    enquiry: { ...cms.enquiry, memberCardCtaUrl: e.target.value },
                  })
                }
                placeholder="Button Target URL"
                className="border border-slate-300 rounded-lg p-2 bg-white w-full"
              />
              <textarea
                rows={2}
                value={cms.enquiry.memberCardDesc}
                onChange={(e) =>
                  setCms({
                    ...cms,
                    enquiry: { ...cms.enquiry, memberCardDesc: e.target.value },
                  })
                }
                placeholder="Card Description"
                className="border border-slate-300 rounded-lg p-2 bg-white w-full resize-none"
              />
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Changes will immediately reflect on the public landing page.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#4caf50] to-[#2f8a36] hover:brightness-110 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckIcon className="w-4 h-4" />
            <span>{saving ? "Publishing Changes..." : "Publish Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
