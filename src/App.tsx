import { useRef, useState, type ChangeEvent } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';

type Analysis = {
  ats_score: number;
  matching_skills: string[];
  missing_skills: string[];
  experience_match: string;
  education_match: string;
  suggestions: string[];
};

type AnalysisResponse = {
  message?: string;
  detail?: string;
  analysis?: Analysis;
  analysis_source?: 'openai' | 'groq' | 'rule_based';
};

// Leave this empty in Vercel to use the same deployed domain's /api route.
// Set VITE_API_BASE_URL only when the API is deployed on a separate domain.
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

function App() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseResume = (file?: File) => {
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage('Please upload a PDF or DOCX file.');
      return;
    }

    setResume(file);
    setMessage('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    chooseResume(event.target.files?.[0]);
  };

  const handleAnalyze = async () => {
    if (!resume || !jobDescription.trim()) {
      setMessage('Add both your resume and a job description to continue.');
      return;
    }

    setIsAnalyzing(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('job_description', jobDescription.trim());

      const response = await fetch(`${apiBaseUrl}/api/resumes/analyze`, {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as AnalysisResponse;

      if (!response.ok) throw new Error(data.detail ?? 'Upload failed. Please try again.');
      setAnalysis(data.analysis ?? null);
      setMessage(data.message ?? 'Analysis complete.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not connect to the API.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[440px] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.3),transparent_65%)]" />

      <section className="relative z-10 mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/25">
              <Sparkles size={21} />
            </span>
            <span className="text-lg font-bold tracking-tight">ResumeAI</span>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300">
            AI Resume Analyzer
          </span>
        </nav>

        <header className="mx-auto mt-16 max-w-3xl text-center sm:mt-20">
          <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-indigo-300 uppercase">Land your next opportunity</p>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Know how well your resume <span className="text-indigo-400">matches.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Upload your resume, add a job description, and get clear AI-powered feedback to improve your application.
          </p>
        </header>

        <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300"><FileText size={20} /></span>
              <div><h2 className="text-lg font-semibold text-white">Your resume</h2><p className="text-sm text-slate-400">PDF or DOCX, up to 10 MB</p></div>
            </div>

            <input ref={inputRef} className="hidden" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); chooseResume(event.dataTransfer.files[0]); }}
              className={`mt-7 flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border border-dashed px-5 text-center transition ${isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 bg-slate-950/40 hover:border-indigo-400 hover:bg-indigo-500/5'}`}
            >
              {resume ? <CheckCircle2 className="mb-3 text-emerald-400" size={34} /> : <UploadCloud className="mb-3 text-indigo-300" size={34} />}
              <span className="font-medium text-white">{resume ? resume.name : 'Drop your resume here'}</span>
              <span className="mt-1 text-sm text-slate-500">{resume ? 'Click to choose another file' : 'or click to browse files'}</span>
            </button>
          </article>

          <article className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><BriefcaseBusiness size={20} /></span>
              <div><h2 className="text-lg font-semibold text-white">Job description</h2><p className="text-sm text-slate-400">Paste the role you want to apply for</p></div>
            </div>
            <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} placeholder="Paste the full job description here..." className="mt-7 h-52 w-full resize-none rounded-2xl border border-slate-700 bg-slate-950/40 p-4 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20" />
          </article>
        </div>

        <div className="mx-auto mt-7 max-w-5xl">
          <button type="button" disabled={isAnalyzing} onClick={handleAnalyze} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-70">
            {isAnalyzing ? <LoaderCircle className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isAnalyzing ? 'Uploading resume...' : 'Analyze my resume'}
          </button>
          {message && <p className="mt-4 text-center text-sm text-amber-300">{message}</p>}
        </div>

        {analysis && <section className="mx-auto mt-10 max-w-5xl rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-2xl shadow-indigo-950/20 sm:p-8">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-6"><div><p className="text-sm font-semibold tracking-widest text-indigo-300 uppercase">Resume assessment</p><h2 className="mt-1 text-2xl font-bold text-white">Match report</h2><p className="mt-2 text-sm text-slate-400">Based on your resume and the selected job description.</p></div><button onClick={() => setAnalysis(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close results"><X size={18} /></button></div>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5"><p className="text-sm font-medium text-indigo-200">Overall match score</p><p className="mt-1 text-5xl font-bold text-white">{analysis.ats_score}<span className="text-xl text-slate-400">/100</span></p><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${analysis.ats_score}%` }} /></div></div>
            <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/10 p-5"><p className="text-sm font-medium text-emerald-200">Experience alignment</p><p className="mt-3 text-xl font-bold text-white">{analysis.experience_match}</p></div>
            <div className="rounded-2xl border border-violet-500/15 bg-violet-500/10 p-5"><p className="text-sm font-medium text-violet-200">Education alignment</p><p className="mt-3 text-xl font-bold text-white">{analysis.education_match}</p></div>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5"><h3 className="font-semibold text-white">Matching skills</h3><div className="mt-4 flex flex-wrap gap-2">{analysis.matching_skills.length ? analysis.matching_skills.map((skill) => <span key={skill} className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">{skill}</span>) : <p className="text-sm text-slate-500">No recognized skills matched yet.</p>}</div></div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5"><h3 className="font-semibold text-white">Missing skills</h3><div className="mt-4 flex flex-wrap gap-2">{analysis.missing_skills.length ? analysis.missing_skills.map((skill) => <span key={skill} className="rounded-full bg-amber-400/10 px-3 py-1 text-sm text-amber-300">{skill}</span>) : <p className="text-sm text-emerald-300">Great — no missing recognized skills.</p>}</div></div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/40 p-5"><h3 className="font-semibold text-white">Recommended improvements</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-300">{analysis.suggestions.map((suggestion) => <li key={suggestion} className="flex gap-2"><Sparkles className="mt-1 shrink-0 text-indigo-300" size={14} />{suggestion}</li>)}</ul></div>
        </section>}

        <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3">
          {[
            ['ATS score', 'See how well your resume fits the role.'],
            ['Skill matching', 'Find matching and missing skills.'],
            ['Actionable feedback', 'Get simple ways to improve.'],
          ].map(([title, description]) => <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5"><h3 className="font-semibold text-slate-200">{title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{description}</p></div>)}
        </div>
      </section>
    </main>
  );
}

export default App;
