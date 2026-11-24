import { useState } from "react";
import { get, ref, set, update, remove } from "../lib/store.ts";
import { db } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import { DEFAULT_QUESTIONS } from "../lib/defaultQuestions.ts";
import { MORE_QUESTIONS } from "../lib/moreQuestions.ts";
import { EXTRA_QUESTIONS } from "../lib/extraQuestions.ts";
import { QSETS, SET_IDS, setOf, type QSet } from "../lib/questionSets.ts";

/** Every question the app comes with: the original 63 Quality questions, the added sets, and the 24 Nov additions (100 a set). */
export const ALL_DEFAULT_QUESTIONS = [...DEFAULT_QUESTIONS, ...MORE_QUESTIONS, ...EXTRA_QUESTIONS];
import type { Question, Text } from "../lib/types.ts";

const TF = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

/**
 * First visit: load every default question. Later visits: add the question sets once (the
 * November 2026 additions), without touching the host's own questions, edits or deletions.
 */
export async function seedQuestionsIfEmpty(current: Record<string, Question> | null) {
  if (!current || !Object.keys(current).length) {
    await set(ref(db, "questions"), Object.fromEntries(ALL_DEFAULT_QUESTIONS.map((q) => [q.id, q])));
    await set(ref(db, "setup/qsetsAdded"), true).catch(() => {});
    await set(ref(db, "setup/q100Added"), true).catch(() => {});
    return;
  }
  await addOnce(current, "setup/qsetsAdded", MORE_QUESTIONS);
  await addOnce(current, "setup/q100Added", EXTRA_QUESTIONS);
}

/** Adds a batch of new default questions once (flag), skipping any the database already has. */
async function addOnce(current: Record<string, Question>, flag: string, batch: Question[]) {
  const added = (await get(ref(db, flag)).catch(() => null))?.val();
  if (added) return;
  const missing = batch.filter((q) => !current[q.id]);
  if (missing.length) await update(ref(db, "questions"), Object.fromEntries(missing.map((q) => [q.id, q])));
  await set(ref(db, flag), true);
}

export default function QuestionManager({ onClose }: { onClose: () => void }) {
  const qs = useDbValue<Record<string, Question>>("questions");
  const [editing, setEditing] = useState<Question | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState<QSet | "all">("all");
  const all = Object.values(qs ?? {}).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  const list = all.filter((q) => tab === "all" || setOf(q) === tab);
  const on = list.filter((q) => q.enabled).length;
  const shown = list.filter((q) => !filter || (q.q.en + q.q.ms + q.cat).toLowerCase().includes(filter.toLowerCase()));
  const setName = (id: QSet) => QSETS.find((s) => s.id === id)!.en;

  return (
    <div className="modal-back" role="dialog" aria-modal="true" aria-label="Questions">
      <div className="modal">
        <div className="modal-head">
          <h2>Questions</h2>
          <span className="muted">
            {on} of {list.length} switched on
          </span>
          <span className="grow" />
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
        {editing ? (
          <Editor q={editing} onDone={() => setEditing(null)} />
        ) : (
          <>
            <div className="qset-tabs" role="tablist" aria-label="Question sets">
              {(["all", ...SET_IDS] as (QSet | "all")[]).map((s) => (
                <button key={s} role="tab" aria-selected={tab === s} className={`qset-tab ${tab === s ? "on" : ""}`} onClick={() => setTab(s)}>
                  {s === "all" ? "All" : setName(s)} <span>{s === "all" ? all.length : all.filter((q) => setOf(q) === s).length}</span>
                </button>
              ))}
            </div>
            <div className="modal-tools">
              <input id="qfilter" placeholder="Search questions" value={filter} onChange={(e) => setFilter(e.target.value)} />
              <button
                className="btn primary"
                onClick={() =>
                  setEditing({ id: "c" + Date.now().toString(36), cat: "My questions", set: tab === "all" ? "quality" : tab, type: "mc", q: { en: "", ms: "" }, opts: [0, 1, 2, 3].map(() => ({ en: "", ms: "" })), ans: 0, enabled: true })
                }
              >
                + Add question
              </button>
              <button className="btn" onClick={() => update(ref(db, "questions"), Object.fromEntries(list.map((q) => [`${q.id}/enabled`, true])))}>
                Switch all on{tab === "all" ? "" : ` (${setName(tab)})`}
              </button>
              {confirmRestore ? (
                <span className="confirm">
                  Replace all questions with the original {ALL_DEFAULT_QUESTIONS.length}? Your own and edited questions will be lost.
                  <button
                    className="btn danger"
                    onClick={async () => {
                      await set(ref(db, "questions"), null);
                      await seedQuestionsIfEmpty(null);
                      setConfirmRestore(false);
                    }}
                  >
                    Yes, replace
                  </button>
                  <button className="btn" onClick={() => setConfirmRestore(false)}>
                    No
                  </button>
                </span>
              ) : (
                <button className="btn" onClick={() => setConfirmRestore(true)}>
                  Restore original questions
                </button>
              )}
            </div>
            <ul className="qlist">
              {shown.map((q) => {
                const opts = q.type === "tf" ? TF : q.opts ?? [];
                return (
                  <li key={q.id} className={q.enabled ? "" : "off"}>
                    <label className="switch" title={q.enabled ? "Switched on" : "Switched off"}>
                      <input type="checkbox" id={`on-${q.id}`} checked={q.enabled} onChange={(e) => set(ref(db, `questions/${q.id}/enabled`), e.target.checked)} />
                      <span />
                    </label>
                    <div className="qtext">
                      <div className="qmeta">
                        {setName(setOf(q))} · {q.cat} · {q.type === "tf" ? "True/False" : "Multiple choice"}
                      </div>
                      <div className="en">{q.q.en}</div>
                      <div className="ms">{q.q.ms}</div>
                      <div className="qans">✔ {opts[q.ans]?.en}</div>
                    </div>
                    <div className="qbtns">
                      <button className="btn" onClick={() => setEditing(q)}>
                        Edit
                      </button>
                      <button className="btn" onClick={() => remove(ref(db, `questions/${q.id}`))} aria-label="Delete question">
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Editor({ q, onDone }: { q: Question; onDone: () => void }) {
  const [d, setD] = useState<Question>(() => ({ ...q, opts: q.opts ?? [0, 1, 2, 3].map(() => ({ en: "", ms: "" })) }));
  const [err, setErr] = useState("");
  const setOpt = (i: number, k: keyof Text, v: string) => setD({ ...d, opts: d.opts!.map((o, j) => (j === i ? { ...o, [k]: v } : o)) });

  async function save() {
    if (!d.q.en.trim() || !d.q.ms.trim()) return setErr("Type the question in English and Malay.");
    const out: Question = { id: d.id, cat: d.cat || "My questions", set: setOf(d), type: d.type, q: { en: d.q.en.trim(), ms: d.q.ms.trim() }, ans: d.ans, enabled: d.enabled };
    if (d.type === "mc") {
      const opts = d.opts!.map((o) => ({ en: o.en.trim(), ms: o.ms.trim() }));
      if (opts.some((o) => !o.en || !o.ms)) return setErr("Fill in all 4 answers in English and Malay.");
      out.opts = opts;
      if (out.ans > 3) out.ans = 0;
    } else if (out.ans > 1) out.ans = 0;
    await set(ref(db, `questions/${d.id}`), out);
    onDone();
  }

  return (
    <div className="editor">
      <div className="erow">
        <label>
          Type
          <select id="etype" value={d.type} onChange={(e) => setD({ ...d, type: e.target.value as Question["type"], ans: 0 })}>
            <option value="mc">Multiple choice</option>
            <option value="tf">True / False</option>
          </select>
        </label>
        <label>
          Set
          <select id="eset" value={setOf(d)} onChange={(e) => setD({ ...d, set: e.target.value as QSet })}>
            {SET_IDS.map((s) => (
              <option key={s} value={s}>
                {QSETS.find((x) => x.id === s)!.en}
              </option>
            ))}
          </select>
        </label>
        <label className="grow">
          Topic
          <input id="ecat" value={d.cat} onChange={(e) => setD({ ...d, cat: e.target.value })} />
        </label>
      </div>
      <label>
        Question (English)
        <textarea id="eqen" value={d.q.en} onChange={(e) => setD({ ...d, q: { ...d.q, en: e.target.value } })} />
      </label>
      <label>
        Soalan (Bahasa Melayu)
        <textarea id="eqms" value={d.q.ms} onChange={(e) => setD({ ...d, q: { ...d.q, ms: e.target.value } })} />
      </label>
      {d.type === "mc" ? (
        <div className="eopts">
          <span className="muted">Answers: tick the correct one</span>
          {d.opts!.map((o, i) => (
            <div key={i} className="eopt">
              <input type="radio" id={`eok-${i}`} name="eok" checked={d.ans === i} onChange={() => setD({ ...d, ans: i })} aria-label={`Answer ${i + 1} is correct`} />
              <input id={`een-${i}`} placeholder={`Answer ${i + 1} (English)`} value={o.en} onChange={(e) => setOpt(i, "en", e.target.value)} />
              <input id={`ems-${i}`} placeholder={`Jawapan ${i + 1} (Melayu)`} value={o.ms} onChange={(e) => setOpt(i, "ms", e.target.value)} />
            </div>
          ))}
        </div>
      ) : (
        <label>
          Correct answer
          <select id="etf" value={d.ans} onChange={(e) => setD({ ...d, ans: +e.target.value })}>
            <option value={0}>True / Betul</option>
            <option value={1}>False / Salah</option>
          </select>
        </label>
      )}
      {err && <p className="error">{err}</p>}
      <div className="erow">
        <button className="btn primary" onClick={save}>
          Save
        </button>
        <button className="btn" onClick={onDone}>
          Cancel
        </button>
      </div>
    </div>
  );
}
