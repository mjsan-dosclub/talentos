"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { CaseStudy } from "@/lib/casestudies";
import { StudentMember } from "@/lib/admin-data";
import {
  SparklesIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UploadIcon,
  UserIcon,
  BuildingIcon,
  ShieldCheckIcon,
  ExternalLinkIcon,
  VideoIcon,
  RadioIcon,
  CodeIcon,
  TrashIcon,
} from "@/components/Icons";

const DEFAULT_CATEGORIES = [
  "Distributed Systems",
  "AI & Runtimes",
  "Storage & Compaction",
  "Security & Protocols",
  "Kernel & eBPF",
  "Cloud & DevOps",
  "Frontend Architecture",
];

function CaseStudyEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  // State
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [students, setStudents] = useState<StudentMember[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [showStudentDropdown, setShowStudentDropdown] = useState<boolean>(false);

  // Category track management
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  // Cover Image Upload State
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    subtitle: "",
    shortDescription: "",
    category: "Distributed Systems",
    badge: "SYSTEMS ARCHITECTURE",
    summary: "",
    fullStoryText: "",
    systemAudited: "SYS-04: Distributed Consensus State Machine",
    defenseStatus: "PASSED_WITH_DISTINCTION",
    studentName: "",
    studentDosId: "",
    studentRole: "Systems Pod • Core Contributor",
    studentCollege: "",
    studentTrack: "Systems Engineering",
    studentAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    readTime: "5 min read",
    coverImage: "",
    bannerImage: "",
    socialShareImage: "",
    metaTitle: "",
    metaKeywords: "",
    tagsText: "Rust, Systems, OpenSource",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
    // HTML content for rich text editor
    htmlContent: "",
    videoUrl: "",
    spotifyUrl: "",
    githubRepoUrl: "",
    metrics: [
      { label: "Throughput / Scale", value: "10,240 RPS" },
      { label: "Defense Rating", value: "98.4 / 100" },
    ],
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "html">("visual");

  // DOM HTML Sanitizer function to strip dangerous tags, script injections, on* attributes, and javascript: links
  const sanitizeHtml = (rawHtml: string): string => {
    if (typeof window === "undefined") return rawHtml;
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawHtml, "text/html");

    // Remove executable / non-content elements
    const dangerousElements = doc.querySelectorAll(
      "script, iframe, object, embed, style, link, meta, base, form, input, button, select, textarea"
    );
    dangerousElements.forEach((el) => el.remove());

    // Recursively clean node attributes
    const allowedTags = new Set([
      "H2", "H3", "H4", "P", "B", "STRONG", "I", "EM", "U", "UL", "OL", "LI",
      "BLOCKQUOTE", "CODE", "PRE", "IMG", "A", "BR", "DIV", "SPAN", "HR"
    ]);

    const cleanNode = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toUpperCase();

        if (!allowedTags.has(tagName)) {
          // Unwrap element: replace element with its child nodes
          const parent = element.parentNode;
          while (element.firstChild) {
            parent?.insertBefore(element.firstChild, element);
          }
          parent?.removeChild(element);
          return;
        }

        // Remove dangerous attributes (on*, style containing javascript, javascript: href/src)
        const attrs = Array.from(element.attributes);
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase();
          const attrValue = attr.value.toLowerCase().trim();

          if (
            attrName.startsWith("on") ||
            (attrName === "href" && attrValue.startsWith("javascript:")) ||
            (attrName === "src" && attrValue.startsWith("javascript:"))
          ) {
            element.removeAttribute(attr.name);
          }
        }

        // Recursively clean children
        Array.from(element.childNodes).forEach(cleanNode);
      }
    };

    Array.from(doc.body.childNodes).forEach(cleanNode);
    return doc.body.innerHTML;
  };

  // Sync contentEditable innerHTML when editId finishes loading
  useEffect(() => {
    if (editorRef.current && formData.htmlContent) {
      if (editorRef.current.innerHTML !== formData.htmlContent) {
        editorRef.current.innerHTML = formData.htmlContent;
      }
    }
  }, [formData.htmlContent]);

  // Command handlers for formatting
  const execEditorCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      const sanitized = sanitizeHtml(editorRef.current.innerHTML);
      setFormData((prev) => ({ ...prev, htmlContent: sanitized }));
    }
  };

  const handlePromptImage = () => {
    const url = prompt("Enter Image URL (e.g., https://images.unsplash.com/...):");
    if (url && url.trim()) {
      const cleanUrl = url.trim();
      if (!cleanUrl.toLowerCase().startsWith("javascript:")) {
        execEditorCommand("insertImage", cleanUrl);
      }
    }
  };

  const handlePromptLink = () => {
    const url = prompt("Enter Link URL (e.g., https://github.com/...):");
    if (url && url.trim()) {
      const cleanUrl = url.trim();
      if (!cleanUrl.toLowerCase().startsWith("javascript:")) {
        execEditorCommand("createLink", cleanUrl);
      }
    }
  };

  const handleEditorPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");

    if (pastedText) {
      const clean = sanitizeHtml(pastedText);
      document.execCommand("insertHTML", false, clean);
      if (editorRef.current) {
        const sanitized = sanitizeHtml(editorRef.current.innerHTML);
        setFormData((prev) => ({ ...prev, htmlContent: sanitized }));
      }
    }
  };

  // Fetch students & existing case study (if edit mode)
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        // Fetch Students list for autosuggest
        const studRes = await fetch("/api/students");
        if (studRes.ok) {
          const studData = await studRes.json();
          if (studData.students && Array.isArray(studData.students)) {
            setStudents(studData.students);
          }
        }

        // If editing an existing article
        if (editId) {
          const csRes = await fetch("/api/casestudies");
          if (csRes.ok) {
            const csData = await csRes.json();
            if (csData.success && Array.isArray(csData.casestudies)) {
              const found: CaseStudy | undefined = csData.casestudies.find(
                (c: CaseStudy) => c.id === editId || c.slug === editId
              );
              if (found) {
                // Check custom category
                if (!DEFAULT_CATEGORIES.includes(found.category)) {
                  setCategories((prev) => [...prev, found.category]);
                }

                setFormData({
                  title: found.title || "",
                  slug: found.slug || "",
                  subtitle: found.subtitle || "",
                  shortDescription: found.shortDescription || found.summary || "",
                  category: found.category || "Distributed Systems",
                  badge: found.badge || "SYSTEMS ARCHITECTURE",
                  summary: found.summary || "",
                  fullStoryText: Array.isArray(found.fullStory)
                    ? found.fullStory.join("\n\n")
                    : "",
                  htmlContent: found.htmlContent || (Array.isArray(found.fullStory) ? found.fullStory.map((p) => `<p>${p}</p>`).join("") : ""),
                  systemAudited: found.systemAudited || "SYS-04: Distributed Systems",
                  defenseStatus: found.defenseStatus || "PASSED_WITH_DISTINCTION",
                  studentName: found.student?.name || "",
                  studentDosId: found.student?.dos_id || "",
                  studentRole: found.student?.role || "Systems Pod",
                  studentCollege: found.student?.college || "",
                  studentTrack: found.student?.track || "Systems Engineering",
                  studentAvatar: found.student?.avatar || "",
                  readTime: found.readTime || "5 min read",
                  coverImage: found.coverImage || "",
                  bannerImage: found.bannerImage || found.coverImage || "",
                  socialShareImage: found.socialShareImage || found.coverImage || "",
                  metaTitle: found.metaTitle || found.title || "",
                  metaKeywords: found.metaKeywords || (found.tags ? found.tags.join(", ") : ""),
                  tagsText: found.tags ? found.tags.join(", ") : "",
                  status: found.status || "PUBLISHED",
                  videoUrl: found.mediaEmbeds?.videoUrl || "",
                  spotifyUrl: found.mediaEmbeds?.spotifyUrl || "",
                  githubRepoUrl: found.mediaEmbeds?.githubRepoUrl || found.prUrl || "",
                  metrics:
                    found.metrics && found.metrics.length > 0
                      ? found.metrics
                      : [{ label: "Throughput / Scale", value: "10,240 RPS" }],
                });

                if (found.coverImage) {
                  setCoverPreview(found.coverImage);
                }
                setStudentSearch(found.student?.name || "");
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed loading editor data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [editId]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug && editId ? prev.slug : generatedSlug,
    }));
  };

  // Student selection handler
  const handleSelectStudent = (s: StudentMember) => {
    setFormData((prev) => ({
      ...prev,
      studentName: s.fullName,
      studentDosId: s.dosId,
      studentCollege: s.institution,
      studentAvatar: s.avatar || prev.studentAvatar,
      studentTrack: s.department || prev.studentTrack,
    }));
    setStudentSearch(s.fullName);
    setShowStudentDropdown(false);
  };

  // Add Custom Category Track
  const handleAddCategoryTrack = () => {
    const clean = newCategoryName.trim();
    if (!clean) return;
    if (!categories.includes(clean)) {
      setCategories((prev) => [...prev, clean]);
    }
    setFormData((prev) => ({ ...prev, category: clean }));
    setNewCategoryName("");
    setIsAddingCategory(false);
  };

  // Image Upload Handler
  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    // Check size limit: <= 2MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image exceeds maximum permitted size of 2 MB. Please select a smaller file.");
      return;
    }

    // Check allowed format: jpg / jpeg / png / webp
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type.toLowerCase())) {
      setUploadError("Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP.");
      return;
    }

    setCoverImageFile(file);

    // Local preview URL
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    // Perform upload via API endpoint /api/upload
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", "evidence");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: data.url,
          bannerImage: data.url,
          socialShareImage: data.url,
        }));
      }
    } catch (err: any) {
      setUploadError("Failed to upload image: " + err.message);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.studentName) {
      alert("Please complete required fields (Title, Student Name, Summary)");
      return;
    }

    setSaving(true);
    try {
      const fullStoryParagraphs = formData.fullStoryText
        .split("\n\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        subtitle: formData.subtitle,
        shortDescription: formData.shortDescription || formData.summary,
        category: formData.category,
        badge: formData.badge,
        summary: formData.summary,
        fullStory: fullStoryParagraphs.length > 0 ? fullStoryParagraphs : [formData.summary],
        htmlContent: formData.htmlContent || fullStoryParagraphs.map((p) => `<p>${p}</p>`).join(""),
        systemAudited: formData.systemAudited,
        defenseStatus: formData.defenseStatus,
        student: {
          name: formData.studentName,
          dos_id: formData.studentDosId || "DOS-STUDENT",
          role: formData.studentRole,
          college: formData.studentCollege || "Partner Institution Hub",
          track: formData.studentTrack,
          avatar: formData.studentAvatar || "/images/students/student-1.jpg",
        },
        readTime: formData.readTime,
        coverImage: formData.coverImage || coverPreview || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        bannerImage: formData.bannerImage || formData.coverImage || coverPreview,
        socialShareImage: formData.socialShareImage || formData.coverImage || coverPreview,
        metaTitle: formData.metaTitle || formData.title,
        metaKeywords: formData.metaKeywords,
        tags: formData.tagsText.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
        status: formData.status,
        publishedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        commitHash: `dos-${Math.random().toString(36).substring(2, 8)}`,
        metrics: formData.metrics.filter((m) => m.label && m.value),
        mediaEmbeds: {
          videoUrl: formData.videoUrl,
          spotifyUrl: formData.spotifyUrl,
          githubRepoUrl: formData.githubRepoUrl,
        },
      };

      let res;
      if (editId) {
        res = await fetch("/api/casestudies", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editId, ...payload }),
        });
      } else {
        res = await fetch("/api/casestudies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const resData = await res.json();
      if (resData.success) {
        setNotification(editId ? "Case Study updated successfully!" : "New Case Study authored & published!");
        setTimeout(() => {
          router.push("/admin?tab=casestudies");
        }, 1200);
      } else {
        alert(resData.error || "Failed to save Case Study");
      }
    } catch (err: any) {
      alert("Error saving: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.dosId.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.institution.toLowerCase().includes(studentSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-mono text-xs text-slate-500">
        LOADING_CASESTUDY_EDITOR_ENVIRONMENT...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pb-20">
      <AppHeader />

      {/* Editor Header Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin?tab=casestudies"
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              ← Back to Dossiers
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-[#FF715B]" />
                <span>{editId ? "Edit Student Case Study & Article" : "Author New Student Case Study & Blog"}</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Full-page rich architectural dossier editor & media embedding suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-bold focus:outline-none"
            >
              <option value="PUBLISHED">Published (Visible to All)</option>
              <option value="DRAFT">Draft (Internal Only)</option>
            </select>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2 bg-[#3772FF] hover:bg-[#285cdb] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>{saving ? "Saving..." : editId ? "Save Changes" : "Publish Article"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Form */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 mt-6 space-y-6">
        {notification && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-xs animate-fadeIn">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Catchphrase */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#FF715B] font-mono">
                01 // Article Title & Headlines
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Case Study Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Enter title of architectural breakdown"
                  className="w-full text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Slug / URL Path
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. candidate-distributed-engine"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subtitle / Catchphrase
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g. Zero-grace peer defense breakdown"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Executive Abstract / Summary *
                </label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="e.g. Executive overview of the breakthrough, peer defense, and validated benchmarks..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none leading-relaxed"
                  required
                />
              </div>
            </div>

            {/* Main Article Body Editor (Minimalist Medium/WordPress Style) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#3772FF] font-mono flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-[#3772FF]" />
                  <span>02 // Full Story Body & Article Narrative</span>
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorMode(editorMode === "visual" ? "html" : "visual")}
                    className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
                  >
                    {editorMode === "visual" ? "HTML Code Mode" : "WYSIWYG Visual Mode"}
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">
                    AUTO_SANITY_SANITIZED
                  </span>
                </div>
              </div>

              {/* Minimalist Floating Toolbar */}
              {editorMode === "visual" && (
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => execEditorCommand("formatBlock", "H2")}
                    title="Heading 2"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCommand("formatBlock", "H3")}
                    title="Heading 3"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all"
                  >
                    H3
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => execEditorCommand("bold")}
                    title="Bold text"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-black text-slate-900 transition-all"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCommand("italic")}
                    title="Italic text"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs italic font-serif font-bold text-slate-800 transition-all"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCommand("underline")}
                    title="Underline text"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs underline font-bold text-slate-800 transition-all"
                  >
                    U
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => execEditorCommand("insertUnorderedList")}
                    title="Bullet list"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCommand("insertOrderedList")}
                    title="Numbered list"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all"
                  >
                    1. List
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCommand("formatBlock", "BLOCKQUOTE")}
                    title="Quote block"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-all"
                  >
                    &ldquo; Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => execEditorCommand("formatBlock", "PRE")}
                    title="Code block"
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-mono font-bold text-slate-800 transition-all"
                  >
                    &lt;/&gt; Code
                  </button>

                  <div className="h-4 w-px bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={handlePromptImage}
                    title="Insert image from URL"
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition-all flex items-center gap-1"
                  >
                    <span>📷 Image URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePromptLink}
                    title="Insert hyperlink"
                    className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 text-xs font-bold text-blue-800 transition-all flex items-center gap-1"
                  >
                    <span>🔗 Link</span>
                  </button>
                </div>
              )}

              {/* Editor Workspace Area */}
              {editorMode === "visual" ? (
                <div
                  ref={editorRef}
                  contentEditable
                  onPaste={handleEditorPaste}
                  onInput={() => {
                    if (editorRef.current) {
                      const textContent = editorRef.current.innerText || "";
                      const sanitized = sanitizeHtml(editorRef.current.innerHTML);
                      setFormData((prev) => ({
                        ...prev,
                        htmlContent: sanitized,
                        fullStoryText: textContent,
                      }));
                    }
                  }}
                  className="w-full text-sm sm:text-base bg-white border border-slate-200 rounded-xl p-5 text-slate-900 font-sans leading-relaxed focus:ring-2 focus:ring-[#3772FF] focus:outline-none min-h-[320px] prose max-w-none shadow-inner overflow-y-auto"
                />
              ) : (
                <textarea
                  rows={14}
                  value={formData.htmlContent}
                  onChange={(e) => {
                    const val = e.target.value;
                    const clean = sanitizeHtml(val);
                    setFormData((prev) => ({
                      ...prev,
                      htmlContent: clean,
                      fullStoryText: val.replace(/<[^>]*>/g, ""),
                    }));
                  }}
                  className="w-full text-xs font-mono bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl p-4 leading-relaxed focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[320px]"
                />
              )}

              <p className="text-[11px] text-slate-500 font-medium">
                💡 <strong>WYSIWYG Editor:</strong> Supports copy-pasting rich formatted text directly from Google Docs or ChatGPT. Script tags, inline event handlers, and executable payloads are automatically stripped for security.
              </p>
            </div>

            {/* Media Embedding Suite (Video, Spotify Podcast, GitHub) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-purple-600 font-mono flex items-center gap-2">
                <VideoIcon className="w-4 h-4" />
                <span>03 // Multimedia Embeds (Video, Podcast &amp; Code Repository)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <VideoIcon className="w-3.5 h-3.5 text-rose-500" />
                    <span>Demo Video URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">YouTube or MP4 video URL</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <RadioIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Spotify Podcast URL</span>
                  </label>
                  <input
                    type="url"
                    value={formData.spotifyUrl}
                    onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                    placeholder="https://open.spotify.com/episode/..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Spotify episode or audio link</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <CodeIcon className="w-3.5 h-3.5 text-slate-700" />
                    <span>GitHub Repository / PR</span>
                  </label>
                  <input
                    type="url"
                    value={formData.githubRepoUrl}
                    onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
                    placeholder="https://github.com/org/repo"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Direct code link</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar Settings, Author, Cover Upload, Category Track) */}
          <div className="space-y-6">
            {/* Student Author Search & Autosuggest */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#3772FF]" />
                <span>Student Author Lookup</span>
              </h2>

              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Search &amp; Select Student Author
                </label>
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setFormData({ ...formData, studentName: e.target.value });
                    setShowStudentDropdown(true);
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  placeholder="Type student name or ID..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                />

                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-40 divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectStudent(s)}
                        className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center gap-2.5 transition-colors"
                      >
                        <img
                          src={s.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                          alt={s.fullName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{s.fullName}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">
                            {s.dosId} &bull; {s.institution}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto-filled Student Details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    DOS Student ID
                  </label>
                  <input
                    type="text"
                    value={formData.studentDosId}
                    onChange={(e) => setFormData({ ...formData, studentDosId: e.target.value })}
                    placeholder="Auto-filled ID"
                    className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                    College / Institution
                  </label>
                  <input
                    type="text"
                    value={formData.studentCollege}
                    onChange={(e) => setFormData({ ...formData, studentCollege: e.target.value })}
                    placeholder="Auto-filled College"
                    className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Category Track (Existing + Add Custom) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Category Track &amp; Tagging
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Category Track
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {!isAddingCategory ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="text-xs text-[#3772FF] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Add New Category Track</span>
                </button>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">
                    New Category Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="e.g. Quantum Runtimes"
                      className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategoryTrack}
                      className="px-3 py-1 bg-[#3772FF] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-2 py-1 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tagsText}
                  onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                  placeholder="Rust, Raft, Distributed Systems"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-[#3772FF] focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Image Upload (Strict: JPG / < 2MB with Preview) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center justify-between">
                <span>Article Cover Image</span>
                <span className="text-[10px] text-amber-600 font-extrabold">Max 2 MB (JPG/PNG)</span>
              </h2>

              {coverPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-900 group">
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow cursor-pointer"
                    >
                      Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-slate-200 hover:border-[#3772FF] rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-slate-100/50 transition-all"
                >
                  <UploadIcon className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-700">Click to upload cover picture</div>
                  <div className="text-[10px] text-slate-400 mt-1 font-mono">
                    JPG, JPEG, PNG, WEBP &bull; Max 2 MB limit
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageFileSelect}
                className="hidden"
              />

              {uploadError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold rounded-xl">
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CaseStudyEditorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">LOADING_EDITOR...</div>}>
      <CaseStudyEditorContent />
    </Suspense>
  );
}
