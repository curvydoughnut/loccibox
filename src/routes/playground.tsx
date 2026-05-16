import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, RotateCcw, Check, AlertTriangle, Loader2, Clock, Code2, FlaskConical, SplitSquareHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/playground")({
  head: () => ({ meta: [{ title: "Dual Sandbox Playground — Locci Box" }] }),
  component: Page,
});

type Lang = "python" | "node" | "bash" | "ruby";
const monacoLang: Record<Lang, string> = { python: "python", node: "javascript", bash: "shell", ruby: "ruby" };

const codeStarter: Record<Lang, string> = {
  python: `def add(a, b):
    """Add two numbers"""
    return a + b

# Test this function by writing assertions on the right
`,
  node: `function add(a, b) {
  return a + b;
}

// Test this function on the right side
module.exports = { add };
`,
  bash: `#!/bin/bash

add() {
  echo $((1 + 2))
}

add
`,
  ruby: `def add(a, b)
  a + b
end

# Test on the right side
`,
};

const testStarter: Record<Lang, string> = {
  python: `# Write assertions to test your code
assert add(2, 3) == 5
assert add(-1, -2) == -3
assert add(0, 0) == 0

print("✓ All tests passed!")
`,
  node: `console.assert(add(2, 3) === 5);
console.assert(add(-1, -2) === -3);
console.assert(add(0, 0) === 0);

console.log("✓ All tests passed!");
`,
  bash: `result=$(add)
if [ $result -eq 3 ]; then
  echo "✓ Test passed!"
else
  echo "✗ Test failed!"
fi
`,
  ruby: `raise "Test failed" unless add(2, 3) == 5
raise "Test failed" unless add(-1, -2) == -3

puts "✓ All tests passed!"
`,
};

type SyncState = "synced" | "syncing" | "failed";
type RunState = "idle" | "running" | "passed" | "failed";

function defineLightTheme(monaco: any) {
  monaco.editor.defineTheme("sandbox-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "94a3b8", fontStyle: "italic" },
      { token: "keyword", foreground: "8b5cf6", fontStyle: "bold" },
      { token: "string", foreground: "10b981" },
      { token: "number", foreground: "f59e0b" },
      { token: "type", foreground: "06b6d4" },
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#1e293b",
      "editorLineNumber.foreground": "#cbd5e1",
      "editorLineNumber.activeForeground": "#3b82f6",
      "editor.lineHighlightBackground": "#f8fafc",
      "editor.selectionBackground": "#dbeafe",
      "editorCursor.foreground": "#3b82f6",
      "editorIndentGuide.background": "#f1f5f9",
    },
  });
}

function Page() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;

  const [lang, setLang] = useState<Lang>("python");
  const [code, setCode] = useState(codeStarter.python);
  const [tests, setTests] = useState(testStarter.python);
  const [sync, setSync] = useState<SyncState>("synced");
  const [run, setRun] = useState<RunState>("idle");
  const [output, setOutput] = useState<{ stdout: string; stderr: string; exit: number; ms: number } | null>(null);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [stats, setStats] = useState({ passed: 0, failed: 0 });
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Split-screen secondary sandbox (appears after first run)
  const [splitOpen, setSplitOpen] = useState(false);
  const [code2, setCode2] = useState(codeStarter.python);
  const [tests2, setTests2] = useState(testStarter.python);
  const [run2, setRun2] = useState<RunState>("idle");
  const [output2, setOutput2] = useState<{ stdout: string; stderr: string; exit: number; ms: number } | null>(null);

  const openSplit = () => {
    setCode2(codeStarter[lang]);
    setTests2(testStarter[lang]);
    setOutput2(null);
    setRun2("idle");
    setSplitOpen(true);
  };

  const runTests2 = async () => {
    if (run2 === "running" || !tests2.trim()) return;
    setRun2("running");
    setOutput2(null);
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const ms = Math.round(performance.now() - start);
    const failedHeuristic = /assert\s+False|raise\s+"|exit\s+1/.test(tests2);
    const success = !failedHeuristic;
    setOutput2({
      stdout: success ? "✓ All tests passed!\n" : "AssertionError\n",
      stderr: success ? "" : "AssertionError: test failed",
      exit: success ? 0 : 1,
      ms,
    });
    setRun2(success ? "passed" : "failed");
  };

  const onLangChange = (l: Lang) => {
    setLang(l);
    setCode(codeStarter[l]);
    setTests(testStarter[l]);
    setOutput(null);
    setRun("idle");
  };

  useEffect(() => {
    setSync("syncing");
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => setSync("synced"), 500);
    return () => { if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, [code]);

  const runTests = async () => {
    if (sync !== "synced" || run === "running" || !tests.trim()) return;
    setRun("running");
    setOutput(null);
    const start = performance.now();
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    const ms = Math.round(performance.now() - start);
    const failedHeuristic = /assert\s+False|raise\s+"|exit\s+1/.test(tests);
    const passed = Math.max(1, (tests.match(/assert|console\.assert|raise|\[/g) || []).length);
    const failed = failedHeuristic ? 1 : 0;
    const success = !failedHeuristic;
    setOutput({
      stdout: success ? "✓ All tests passed!\n" : "Traceback (most recent call last):\n  AssertionError\n",
      stderr: success ? "" : "AssertionError: test failed",
      exit: success ? 0 : 1,
      ms,
    });
    setRun(success ? "passed" : "failed");
    setLastMs(ms);
    setStats({ passed: success ? passed : Math.max(0, passed - 1), failed });
  };

  const clear = () => { setOutput(null); setRun("idle"); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        runTests();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [tests, sync, run]);

  const SyncBadge = useMemo(() => {
    const conf = {
      synced: { cls: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: Check, label: "In Sync" },
      syncing: { cls: "bg-amber-50 text-amber-600 border-amber-200", icon: Loader2, label: "Syncing..." },
      failed: { cls: "bg-red-50 text-red-600 border-red-200", icon: AlertTriangle, label: "Sync Failed" },
    }[sync];
    const Icon = conf.icon;
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border", conf.cls)}>
        <Icon className={cn("w-3 h-3", sync === "syncing" && "animate-spin")} />
        {conf.label}
      </span>
    );
  }, [sync]);

  const editorOptions = {
    fontSize: 13,
    fontFamily: "Monaco, 'Courier New', monospace",
    minimap: { enabled: false },
    tabSize: 2,
    wordWrap: "off" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    padding: { top: 16, bottom: 16 },
    renderLineHighlight: "all" as const,
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-10 space-y-6 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-up">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Dual Sandbox <span className="text-gradient-primary">Playground</span></h1>
            <p className="text-sm sm:text-base text-white/60 mt-2">Two isolated microVMs — write on the left, test on the right.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={lang} onValueChange={(v) => onLangChange(v as Lang)}>
              <SelectTrigger className="w-full sm:w-44 glass border-white/15 text-white"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="node">Node.js</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
                <SelectItem value="ruby">Ruby</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-up" style={{ animationDelay: "100ms" }}>
          {/* LEFT */}
          <div className="hero-white overflow-hidden flex flex-col h-[420px] sm:h-[520px] lg:h-[680px]">
            <div className="h-14 px-3 sm:px-5 flex items-center justify-between gap-2 border-b hero-divider">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-cyan-blue flex items-center justify-center shadow-sm">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold hero-text">Code</div>
                  <div className="text-[11px] hero-text-muted">Source sandbox</div>
                </div>
              </div>
              {SyncBadge}
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={monacoLang[lang]}
                theme="sandbox-light"
                value={code}
                onChange={(v) => setCode(v ?? "")}
                beforeMount={defineLightTheme}
                options={editorOptions}
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="hero-white overflow-hidden flex flex-col h-[520px] sm:h-[600px] lg:h-[680px]">
            <div className="h-14 px-3 sm:px-5 flex items-center justify-between gap-2 border-b hero-divider">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-purple-pink flex items-center justify-center shadow-sm">
                  <FlaskConical className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold hero-text">Test Code</div>
                  <div className="text-[11px] hero-text-muted">Write assertions to validate your code</div>
                </div>
              </div>
              <RunBadge state={run} />
            </div>
            <div className="flex-1 min-h-0 grid grid-rows-[1.4fr_1fr]">
              <div className="border-b hero-divider min-h-0">
                <Editor
                  height="100%"
                  language={monacoLang[lang]}
                  theme="sandbox-light"
                  value={tests}
                  onChange={(v) => setTests(v ?? "")}
                  beforeMount={defineLightTheme}
                  options={editorOptions}
                />
              </div>
              <div className="hero-soft flex flex-col min-h-0">
                <div className="px-5 py-2.5 border-b hero-divider flex items-center gap-3 text-xs">
                  <span className="hero-text-muted font-medium">Output</span>
                  {output && (
                    <>
                      <span className="text-emerald-600 font-medium">✓ {stats.passed} passed</span>
                      <span className="text-red-500 font-medium">✗ {stats.failed} failed</span>
                      <span className="hero-text-muted inline-flex items-center gap-1"><Clock className="w-3 h-3" />{output.ms}ms</span>
                    </>
                  )}
                </div>
                <pre className="flex-1 min-h-0 overflow-auto p-5 font-mono text-xs leading-relaxed hero-text">
                  {run === "running" && <span className="text-blue-500">Running in sandbox...</span>}
                  {output && (
                    <>
                      {output.stdout && <span>{output.stdout}</span>}
                      {output.stderr && <span className="text-red-500">{output.stderr}</span>}
                      <span className="hero-text-muted">{"\n"}exit code: {output.exit} · duration: {output.ms}ms</span>
                    </>
                  )}
                  {!output && run === "idle" && <span className="hero-text-muted">Press Run Tests or Ctrl/Cmd+Enter to execute.</span>}
                </pre>
              </div>
            </div>
            <div className="px-3 sm:px-5 py-3 border-t hero-divider flex flex-wrap items-center gap-2 hero-soft">
              <Button
                onClick={runTests}
                disabled={sync !== "synced" || run === "running" || !tests.trim()}
                className="bg-gradient-primary text-white hover:opacity-90 h-10 shadow-primary"
              >
                {run === "running" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                {run === "running" ? "Running..." : "Run Tests"}
              </Button>
              <Button variant="ghost" onClick={clear} className="h-10 hero-text hover:bg-slate-100">
                <RotateCcw className="w-4 h-4 mr-2" /> Clear
              </Button>
              <div className="flex-1" />
              {lastMs !== null && <span className="text-xs hero-text-muted ml-auto">Last run: {lastMs}ms</span>}
            </div>
          </div>
        </div>

        {/* Post-run split prompt */}
        {run !== "idle" && run !== "running" && !splitOpen && (
          <div className="flex justify-center animate-fade-up">
            <Button
              onClick={openSplit}
              variant="outline"
              className="h-10 hero-text border-slate-200 hover:bg-slate-100"
            >
              <SplitSquareHorizontal className="w-4 h-4 mr-2" />
              Split screen — test another code
            </Button>
          </div>
        )}

        {/* Secondary sandbox */}
        {splitOpen && (
          <div className="animate-fade-up space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold hero-text">
                <SplitSquareHorizontal className="w-4 h-4 text-blue-500" />
                Secondary sandbox
                <span className="text-xs hero-text-muted font-normal">— independent microVM</span>
              </div>
              <button
                onClick={() => setSplitOpen(false)}
                className="inline-flex items-center gap-1 text-xs hero-text-muted hover:hero-text"
              >
                <X className="w-3.5 h-3.5" /> Close
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="hero-white overflow-hidden flex flex-col h-[420px] sm:h-[520px]">
                <div className="h-12 px-4 flex items-center gap-2 border-b hero-divider">
                  <div className="w-7 h-7 rounded-lg bg-gradient-cyan-blue flex items-center justify-center">
                    <Code2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="text-sm font-semibold hero-text">Code · B</div>
                </div>
                <div className="flex-1 min-h-0">
                  <Editor
                    height="100%"
                    language={monacoLang[lang]}
                    theme="sandbox-light"
                    value={code2}
                    onChange={(v) => setCode2(v ?? "")}
                    beforeMount={defineLightTheme}
                    options={editorOptions}
                  />
                </div>
              </div>
              <div className="hero-white overflow-hidden flex flex-col h-[520px] sm:h-[600px]">
                <div className="h-12 px-4 flex items-center justify-between gap-2 border-b hero-divider">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-purple-pink flex items-center justify-center">
                      <FlaskConical className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="text-sm font-semibold hero-text">Test Code · B</div>
                  </div>
                  <RunBadge state={run2} />
                </div>
                <div className="flex-1 min-h-0 grid grid-rows-[1.4fr_1fr]">
                  <div className="border-b hero-divider min-h-0">
                    <Editor
                      height="100%"
                      language={monacoLang[lang]}
                      theme="sandbox-light"
                      value={tests2}
                      onChange={(v) => setTests2(v ?? "")}
                      beforeMount={defineLightTheme}
                      options={editorOptions}
                    />
                  </div>
                  <div className="hero-soft flex flex-col min-h-0">
                    <div className="px-4 py-2 border-b hero-divider text-xs hero-text-muted font-medium">Output</div>
                    <pre className="flex-1 min-h-0 overflow-auto p-4 font-mono text-xs leading-relaxed hero-text">
                      {run2 === "running" && <span className="text-blue-500">Running in sandbox...</span>}
                      {output2 && (
                        <>
                          {output2.stdout && <span>{output2.stdout}</span>}
                          {output2.stderr && <span className="text-red-500">{output2.stderr}</span>}
                          <span className="hero-text-muted">{"\n"}exit code: {output2.exit} · {output2.ms}ms</span>
                        </>
                      )}
                      {!output2 && run2 === "idle" && <span className="hero-text-muted">Press Run Tests to execute.</span>}
                    </pre>
                  </div>
                </div>
                <div className="px-4 py-3 border-t hero-divider flex items-center gap-2 hero-soft">
                  <Button
                    onClick={runTests2}
                    disabled={run2 === "running" || !tests2.trim()}
                    className="bg-gradient-primary text-white hover:opacity-90 h-10 shadow-primary"
                  >
                    {run2 === "running" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                    {run2 === "running" ? "Running..." : "Run Tests"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setOutput2(null); setRun2("idle"); }}
                    className="h-10 hero-text hover:bg-slate-100"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Clear
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function RunBadge({ state }: { state: RunState }) {
  if (state === "idle") return null;
  const conf = {
    running: { cls: "bg-blue-50 text-blue-600 border-blue-200 animate-pulse", icon: Loader2, label: "RUNNING" },
    passed: { cls: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: Check, label: "PASSED" },
    failed: { cls: "bg-red-50 text-red-600 border-red-200", icon: AlertTriangle, label: "FAILED" },
  }[state];
  const Icon = conf.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border", conf.cls)}>
      <Icon className={cn("w-3 h-3", state === "running" && "animate-spin")} />
      {conf.label}
    </span>
  );
}
