import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Upload, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api';

const API_BASE = '/resume';

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function extractBulletSection(text, headings) {
  if (!text) return null;
  const normalized = String(text);

  // Find the first occurrence of any heading marker we recognize.
  // We accept variants like "Areas to Improve", "Areas for Improvement", "Improvements".
  const headingRegex = new RegExp(
    String.raw`(^|\n)\s{0,3}#{1,6}\s*(${headings.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\s*(?:\n|$)`,
    'i'
  );

  const match = normalized.match(headingRegex);
  if (!match || match.index == null) return null;

  const startIdx = match.index + match[0].length;
  const remainder = normalized.slice(startIdx);

  // Stop at next heading.
  const nextHeading = remainder.search(/\n\s{0,3}#{1,6}\s+\S/);
  const section = (nextHeading === -1 ? remainder : remainder.slice(0, nextHeading)).trim();
  if (!section) return null;

  const bullets = section
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => /^[-*•]\s+/.test(l))
    .map((l) => l.replace(/^[-*•]\s+/, '').trim())
    .filter(Boolean);

  return bullets.length ? bullets : null;
}

function renderInline(text) {
  const s = String(text ?? '');
  if (!s) return null;

  // Very small "markdown-ish" renderer: **bold** and `code`.
  // Safe by default (no HTML injection), just splits into React nodes.
  const parts = [];
  let i = 0;

  const pushText = (t) => {
    if (!t) return;
    parts.push(t);
  };

  while (i < s.length) {
    const boldStart = s.indexOf('**', i);
    const codeStart = s.indexOf('`', i);

    const next = [boldStart, codeStart].filter((x) => x !== -1).sort((a, b) => a - b)[0];
    if (next == null) {
      pushText(s.slice(i));
      break;
    }

    if (next > i) pushText(s.slice(i, next));

    if (next === boldStart) {
      const end = s.indexOf('**', boldStart + 2);
      if (end === -1) {
        pushText(s.slice(boldStart));
        break;
      }
      const content = s.slice(boldStart + 2, end);
      parts.push(
        <strong key={`b-${boldStart}`} className="text-white font-black">
          {content}
        </strong>
      );
      i = end + 2;
      continue;
    }

    // inline code
    const end = s.indexOf('`', codeStart + 1);
    if (end === -1) {
      pushText(s.slice(codeStart));
      break;
    }
    const content = s.slice(codeStart + 1, end);
    parts.push(
      <code
        key={`c-${codeStart}`}
        className="px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-indigo-200 font-bold"
      >
        {content}
      </code>
    );
    i = end + 1;
  }

  return parts;
}

function renderAnalysis(text) {
  if (!text) return null;
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');

  const blocks = [];
  let paragraph = [];
  let bullets = [];
  let ordered = [];

  const flushParagraph = () => {
    const p = paragraph.join(' ').trim();
    if (!p) return;
    blocks.push({ type: 'p', text: p });
    paragraph = [];
  };

  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push({ type: 'ul', items: bullets });
    bullets = [];
  };

  const flushOrdered = () => {
    if (!ordered.length) return;
    blocks.push({ type: 'ol', items: ordered });
    ordered = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushOrdered();
      flushBullets();
      flushParagraph();
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushOrdered();
      flushBullets();
      flushParagraph();
      const level = headingMatch[1].length;
      const content = headingMatch[2].trim();
      if (content) blocks.push({ type: 'h', level, text: content });
      continue;
    }

    // Handle "1. ... 2. ... 3. ..." style lists even if the model returns them in one line.
    // This inserts line breaks before new numbered items.
    const numberedExpanded = trimmed.replace(/(?<!\d)\s+(?=\d+[.)]\s)/g, '\n');
    const numberedLines = numberedExpanded.includes('\n') ? numberedExpanded.split('\n') : [trimmed];

    let consumedAsNumbered = false;
    for (const nl of numberedLines) {
      const nlt = nl.trim();
      const orderedMatch = nlt.match(/^(\d+)[.)]\s+(.*)$/);
      if (orderedMatch) {
        flushBullets();
        flushParagraph();
        const content = orderedMatch[2].trim();
        if (content) ordered.push(content);
        consumedAsNumbered = true;
      } else if (consumedAsNumbered && ordered.length) {
        // Continuation line for the last ordered item (wraps / extra info).
        ordered[ordered.length - 1] = `${ordered[ordered.length - 1]} ${nlt}`.trim();
      }
    }
    if (consumedAsNumbered) continue;

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      flushOrdered();
      flushParagraph();
      const content = bulletMatch[1].trim();
      if (content) bullets.push(content);
      continue;
    }

    // fallback: paragraph line
    flushOrdered();
    flushBullets();
    paragraph.push(trimmed);
  }

  flushOrdered();
  flushBullets();
  flushParagraph();

  return blocks.map((b, idx) => {
    if (b.type === 'h') {
      const size =
        b.level <= 2
          ? 'text-3xl'
          : b.level === 3
            ? 'text-2xl'
            : b.level === 4
              ? 'text-xl'
              : 'text-lg';
      return (
        <div key={`h-${idx}`} className="mt-8 first:mt-0">
          <div className={`${size} text-white font-black tracking-tight leading-tight`}>
            {renderInline(b.text)}
          </div>
          <div className="mt-3 h-px w-full bg-gradient-to-r from-indigo-400/70 via-white/10 to-transparent" />
        </div>
      );
    }

    if (b.type === 'ul') {
      return (
        <ul key={`ul-${idx}`} className="mt-4 space-y-3">
          {b.items.map((it, j) => (
            <li key={`li-${idx}-${j}`} className="flex gap-3">
              <span className="mt-2 w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
              <span className="text-text-secondary font-medium leading-relaxed">
                {renderInline(it)}
              </span>
            </li>
          ))}
        </ul>
      );
    }

    if (b.type === 'ol') {
      return (
        <ol key={`ol-${idx}`} className="mt-4 space-y-4">
          {b.items.map((it, j) => (
            <li key={`oli-${idx}-${j}`} className="flex gap-3">
              <span className="mt-0.5 w-8 h-8 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-200 font-black flex items-center justify-center shrink-0">
                {j + 1}
              </span>
              <div className="text-text-secondary font-medium leading-relaxed">
                {renderInline(it)}
              </div>
            </li>
          ))}
        </ol>
      );
    }

    return (
      <p key={`p-${idx}`} className="mt-4 text-text-secondary font-medium leading-relaxed">
        {renderInline(b.text)}
      </p>
    );
  });
}

const ResumeAnalyze = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setFileUrl('');
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const improvementBullets = useMemo(() => {
    return extractBulletSection(result, [
      'Areas to Improve',
      'Areas for Improvement',
      'Improvements',
      'Recommendations',
      'Action Items',
      'What to Improve',
    ]);
  }, [result]);

  const renderedFullAnalysis = useMemo(() => renderAnalysis(result), [result]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid PDF file.');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`${API_BASE}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data.analysis);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-4">
          <FileText className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-4xl font-black text-white mb-4 tracking-tight uppercase">AI RESUME <span className="text-indigo-400 italic font-medium">SCANNER</span></h1>
        <p className="text-text-secondary text-lg font-medium">Get your profile ready for top-tier companies in seconds.</p>
      </motion.div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-16 rounded-[2.5rem] border-dashed border-2 border-indigo-500/20 flex flex-col items-center justify-center text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <input 
            type="file" 
            id="resume-upload" 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileChange}
          />
          
          <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-8 mx-auto border border-indigo-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            {file ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            ) : (
              <Upload className="w-12 h-12 text-indigo-400" />
            )}
          </div>
          
          <h2 className="text-3xl font-black text-white mb-3">
            {file ? file.name : 'Upload your Resume'}
          </h2>
          <p className="text-text-secondary mb-10 text-lg font-medium">
            Drag and drop or click to browse. (PDF only)
          </p>

          <div className="flex flex-col items-center gap-4">
            <label 
              htmlFor="resume-upload"
              className="px-12 py-5 bg-white text-black font-black rounded-2xl cursor-pointer hover:bg-white/90 transition-all uppercase tracking-tighter"
            >
              CHOOSE DOCUMENT
            </label>
            
            <AnimatePresence>
              {file && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={handleUpload}
                  disabled={loading}
                  className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/30 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      ANALYZING...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      GENERATE REPORT
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
            >
              <AlertCircle className="w-5 h-5" />
              <span className="font-bold">{error}</span>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-200 font-black tracking-wide uppercase text-sm">Analysis complete</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tight uppercase">
                Resume <span className="text-indigo-400 italic font-medium">Report</span>
              </h2>
              <p className="text-text-secondary font-medium mt-2">
                Preview your uploaded resume on the left and review the findings on the right.
              </p>
            </div>

            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setError(null);
              }}
              className="self-start sm:self-auto px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black uppercase tracking-widest transition-colors"
            >
              Analyze another
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: PDF preview */}
            <div className="glass-panel rounded-[2.5rem] border border-indigo-500/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-black truncate">{file?.name || 'Resume.pdf'}</div>
                      <div className="text-text-secondary text-sm font-semibold">
                        {file ? `${formatBytes(file.size)} • PDF` : 'PDF'}
                      </div>
                    </div>
                  </div>
                </div>

                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-black uppercase tracking-widest text-xs transition-colors"
                  >
                    Open
                  </a>
                )}
              </div>

              <div className="relative bg-black/20">
                {fileUrl ? (
                  <iframe
                    title="Resume preview"
                    src={fileUrl}
                    className="w-full h-[70vh] lg:h-[75vh]"
                  />
                ) : (
                  <div className="p-10 text-center text-text-secondary font-bold">
                    No preview available.
                  </div>
                )}
              </div>
            </div>

            {/* Right: analysis */}
            <div className="flex flex-col gap-6">
              <div className="glass-panel p-8 rounded-[2.5rem] border border-indigo-500/10">
                <div className="flex items-center justify-between gap-4 mb-6">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight m-0">Key improvements</h3>
                  <div className="text-xs font-black uppercase tracking-widest text-indigo-200/80 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-2xl">
                    actionable
                  </div>
                </div>

                {improvementBullets ? (
                  <ul className="space-y-3">
                    {improvementBullets.slice(0, 10).map((b, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                        <span className="text-text-secondary font-semibold leading-relaxed">{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-text-secondary font-semibold leading-relaxed">
                    Couldn’t detect a dedicated “Areas to improve” section in the response. The full analysis is shown below.
                  </div>
                )}
              </div>

              <div className="glass-panel p-10 rounded-[2.5rem] border border-white/10 prose prose-invert max-w-none overflow-hidden">
                <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight m-0">Full analysis</h3>
                </div>
                <div className="max-h-[55vh] lg:max-h-[60vh] overflow-auto pr-2">
                  <div className="text-lg">
                    {renderedFullAnalysis || (
                      <div className="text-text-secondary font-semibold leading-relaxed whitespace-pre-wrap">
                        {result}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feature Grids (only shown when no result) */}
      {!result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="glass-card p-8 rounded-3xl border-indigo-500/10">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-6" />
            <h3 className="text-xl font-black text-white mb-3">ATS OPTIMIZATION</h3>
            <p className="text-sm text-text-secondary font-medium leading-relaxed">Check how well your resume matches common applicant tracking system requirements.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl border-indigo-500/10">
             <FileText className="w-8 h-8 text-indigo-400 mb-6" />
            <h3 className="text-xl font-black text-white mb-3">KEYWORD SCAN</h3>
            <p className="text-sm text-text-secondary font-medium leading-relaxed">Identify high-impact keywords that recruiters and bots look for.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl border-indigo-500/10">
            <Sparkles className="w-8 h-8 text-indigo-400 mb-6" />
            <h3 className="text-xl font-black text-white mb-3">TAILORED PREP</h3>
            <p className="text-sm text-text-secondary font-medium leading-relaxed">Get 5+ custom behavioral and technical questions based on your specific background.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyze;
