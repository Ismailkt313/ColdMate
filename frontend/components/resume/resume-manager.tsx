"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  ExternalLink,
  Loader2,
  CheckCircle2,
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  Languages,
  X,
  Eye,
  Download,
} from "lucide-react";
import { IResume } from "../../types/resume";
import { ResumeService } from "../../services/resume.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_EXTENSIONS = [".pdf", ".docx"];

function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only PDF and DOCX files are supported";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File size must be under 10 MB";
  }
  return null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/8 text-primary border border-primary/15">
      {skill}
    </span>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</h4>
    </div>
  );
}

interface ResumeManagerProps {
  onResumeChange?: (resume: IResume | null) => void;
}

export function ResumeManager({ onResumeChange }: ResumeManagerProps) {
  const [resume, setResume] = useState<IResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const updateResume = useCallback(
    (r: IResume | null) => {
      setResume(r);
      onResumeChange?.(r);
    },
    [onResumeChange]
  );

  const loadResume = useCallback(async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await ResumeService.get();
      if (res.success) {
        updateResume(res.data.resume);
      }
    } catch (e: any) {
      if (e.response?.status === 404) {
        updateResume(null);
      } else {
        setFetchError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [updateResume]);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const handleUpload = async (file: File, isReplace = false) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setSuccess(null);
    setUploading(true);
    setUploadProgress(0);

    const progress = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 8, 85));
    }, 300);

    try {
      const res = isReplace
        ? await ResumeService.replace(file)
        : await ResumeService.upload(file);

      if (res.success) {
        clearInterval(progress);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 600);
        updateResume(res.data.resume);
        showSuccess(isReplace ? "Resume replaced and re-parsed successfully!" : "Resume uploaded and parsed successfully!");
      }
    } catch (e: any) {
      clearInterval(progress);
      setUploadProgress(0);
      setError(e.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your resume? This will also remove the parsed resume data.")) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      await ResumeService.remove();
      updateResume(null);
      showSuccess("Resume deleted successfully.");
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to delete resume.");
    } finally {
      setDeleting(false);
    }
  };

  const handleViewResume = () => {
    if (!resume) return;
    const isPdf = resume.resumeName.toLowerCase().endsWith(".pdf") || resume.resumeUrl.toLowerCase().includes(".pdf");
    const canPreviewPdf = typeof navigator !== "undefined" && navigator.pdfViewerEnabled;
    
    if (isPdf && canPreviewPdf) {
      setShowPreviewModal(true);
    } else {
      window.open(resume.resumeUrl, "_blank");
    }
  };

  const handleDownloadResume = () => {
    if (!resume) return;
    const downloadUrl = resume.resumeUrl.replace("/upload/", "/upload/fl_attachment/");
    window.open(downloadUrl, "_blank");
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUpload(file, !!resume);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [resume]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="space-y-2">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-16 bg-muted rounded-xl" />
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Resume</CardTitle>
          <CardDescription>We encountered an issue fetching your resume details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-destructive">Failed to retrieve resume from server. Please check your connection.</p>
          <Button onClick={loadResume} size="sm" className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isPdf = resume ? (resume.resumeName.toLowerCase().endsWith(".pdf") || resume.resumeUrl.toLowerCase().includes(".pdf")) : false;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Resume</CardTitle>
              <CardDescription>Upload your PDF or DOCX resume. Our AI will parse and structure it automatically.</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {success}
            </div>
          )}

          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Uploading and parsing with AI…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {!resume ? (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">No resume uploaded yet.</p>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group ${
                  dragOver
                    ? "border-primary/60 bg-primary/5"
                    : "border-border/50 hover:border-primary/40 hover:bg-secondary/30"
                }`}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f, false);
                  }}
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary border border-border/40 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                    {uploading ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {dragOver ? "Drop your resume here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">PDF or DOCX — maximum 10 MB</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Resume Card Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-secondary/30 border border-border/40 text-xs">
                <div className="min-w-0">
                  <span className="text-muted-foreground font-medium block">Resume Name</span>
                  <span className="text-foreground font-semibold break-all truncate block" title={resume.resumeName}>
                    {resume.resumeName}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">Upload Date</span>
                  <span className="text-foreground font-semibold block">
                    {formatDate(resume.createdAt || resume.updatedAt)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">File Size</span>
                  <span className="text-foreground font-semibold block">
                    {formatFileSize(resume.fileSize)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium block">Resume Status</span>
                  <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 capitalize">
                    {resume.status || "parsed"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5">
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f, true);
                  }}
                />
                <Button
                  onClick={handleViewResume}
                  variant="default"
                  size="sm"
                  className="h-9 gap-1.5"
                  disabled={uploading || deleting}
                >
                  <Eye className="h-4 w-4" />
                  View Resume
                </Button>
                
                <Button
                  onClick={handleDownloadResume}
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  disabled={uploading || deleting}
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>

                <Button
                  onClick={() => replaceInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5"
                  disabled={uploading || deleting}
                >
                  <RefreshCw className="h-4 w-4" />
                  Replace
                </Button>

                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                  className="h-9 px-3"
                  disabled={uploading || deleting}
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>

              {/* Parsed Resume Details Preview */}
              {resume.parsedData && (
                <div className="space-y-4 pt-4 border-t border-border/40">
                  {(resume.parsedData.fullName || resume.parsedData.email || resume.parsedData.location) && (
                    <div className="space-y-1">
                      <SectionHeader icon={User} title="Identity" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs pl-5">
                        {resume.parsedData.fullName && (
                          <span className="text-foreground font-medium">{resume.parsedData.fullName}</span>
                        )}
                        {resume.parsedData.email && (
                          <span className="text-muted-foreground">{resume.parsedData.email}</span>
                        )}
                        {resume.parsedData.phone && (
                          <span className="text-muted-foreground">{resume.parsedData.phone}</span>
                        )}
                        {resume.parsedData.location && (
                          <span className="text-muted-foreground">{resume.parsedData.location}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {resume.parsedData.skills.length > 0 && (
                    <div>
                      <SectionHeader icon={Code2} title="Skills" />
                      <div className="flex flex-wrap gap-1.5 pl-5">
                        {resume.parsedData.skills.slice(0, 20).map((s, i) => (
                          <SkillBadge key={i} skill={s} />
                        ))}
                        {resume.parsedData.skills.length > 20 && (
                          <span className="text-[10px] text-muted-foreground self-center">
                            +{resume.parsedData.skills.length - 20} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {resume.parsedData.experience.length > 0 && (
                    <div>
                      <SectionHeader icon={Briefcase} title="Experience" />
                      <div className="space-y-2 pl-5">
                        {resume.parsedData.experience.slice(0, 3).map((exp, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="font-semibold text-foreground truncate">{exp.title}</span>
                              {(exp.startDate || exp.endDate) && (
                                <span className="text-muted-foreground shrink-0 text-[10px]">
                                  {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : ""}
                                </span>
                              )}
                            </div>
                            {exp.company && <p className="text-muted-foreground">{exp.company}</p>}
                          </div>
                        ))}
                        {resume.parsedData.experience.length > 3 && (
                          <p className="text-[10px] text-muted-foreground">
                            +{resume.parsedData.experience.length - 3} more positions
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {resume.parsedData.education.length > 0 && (
                    <div>
                      <SectionHeader icon={GraduationCap} title="Education" />
                      <div className="space-y-2 pl-5">
                        {resume.parsedData.education.map((edu, i) => (
                          <div key={i} className="text-xs">
                            <div className="flex justify-between items-baseline gap-2">
                              <span className="font-semibold text-foreground truncate">
                                {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                              </span>
                              {(edu.startDate || edu.endDate) && (
                                <span className="text-muted-foreground shrink-0 text-[10px]">
                                  {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}
                                </span>
                              )}
                            </div>
                            {edu.institution && (
                              <p className="text-muted-foreground">{edu.institution}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resume.parsedData.certifications.length > 0 && (
                    <div>
                      <SectionHeader icon={Award} title="Certifications" />
                      <div className="space-y-1 pl-5">
                        {resume.parsedData.certifications.map((cert, i) => (
                          <div key={i} className="text-xs flex justify-between gap-2">
                            <span className="text-foreground font-medium">{cert.name}</span>
                            <span className="text-muted-foreground shrink-0 text-[10px]">
                              {cert.issuer} {cert.date ? `· ${cert.date}` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {resume.parsedData.languages.length > 0 && (
                    <div>
                      <SectionHeader icon={Languages} title="Languages" />
                      <div className="flex flex-wrap gap-1.5 pl-5">
                        {resume.parsedData.languages.map((lang, i) => (
                          <SkillBadge key={i} skill={lang} />
                        ))}
                      </div>
                    </div>
                  )}

                  {resume.parsedData.preferredRoles.length > 0 && (
                    <div className="pt-1 border-t border-border/30">
                      <p className="text-[10px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Preferred roles: </span>
                        {resume.parsedData.preferredRoles.join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embedded Resume Preview Modal */}
      {showPreviewModal && resume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate max-w-md" title={resume.resumeName}>
                  {resume.resumeName}
                </h3>
                <p className="text-[10px] text-muted-foreground">Document Preview</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={resume.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-md text-xs font-semibold hover:bg-accent text-muted-foreground hover:text-foreground border border-border/50 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in new tab
                </a>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-0 bg-secondary/10 overflow-hidden relative">
              {isPdf ? (
                <iframe
                  src={resume.resumeUrl}
                  className="w-full h-full border-0"
                  title="Resume PDF Preview"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-amber-500" />
                  </div>
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">Preview Unavailable</h4>
                    <p className="text-xs text-muted-foreground leading-normal">
                      Preview is not supported for Word documents (.docx) inside the application.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleDownloadResume} size="sm" className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      Download File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
