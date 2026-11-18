import { useState } from "react";
import { ref, set, update, remove } from "firebase/database";
import { db } from "../lib/firebase.ts";
import { useDbValue } from "../lib/useDb.ts";
import { DEFAULT_QUESTIONS } from "../lib/defaultQuestions.ts";
import type { Question, Text } from "../lib/types.ts";

const TF = [
  { en: "True", ms: "Betul" },
  { en: "False", ms: "Salah" },
];

export async function seedQuestionsIfEmpty(current: Record<string, Question> | null) {
  if (current && Object.keys(current).length) return;
  await set(ref(db, "questions"), Object.fromEntries(DEFAULT_QUESTIONS.map((q) => [q.id, q])));
}

export default function QuestionManager({ onClose }: { onClose: () => void }) {
  const qs = useDbValue<Record<string, Question>>("questions");
  const [editing, setEditing] = useState<Question | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  const [filter, setFilter] = useState("");
  const list = Object.values(qs ?? {}).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  const on = list.filter((q) => q.enabled).length;
  const shown = list.filter((q) => !filter || (q.q.en + q.q.ms + q.cat).toLowerCase().includes(filter.toLowerCase()));

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
            <div className="modal-tools">
              <input id="qfilter" placeholder="Search questions" value={filter} onChange={(e) => setFilter(e.target.value)} />
              <button
                className="btn primary"
                onClick={() =>
                  setEditing({ id: "c" + Date.now().toString(36), cat: "My questions", type: "mc", q: { en: "", ms: "" }, opts: [0, 1, 2, 3].map(() => ({ en: "", ms: "" })), ans: 0, enabled: true })
                }
              >
                + Add question
              </button>
              <button className="btn" onClick={() => update(ref(db, "questions"), Object.fromEntries(list.map((q) => [`${q.id}/enabled`, true])))}>
                Switch all on
              </button>
              {confirmRestore ? (
                <span className="confirm">
                  Replace all questions with the original 63?
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
                        {q.cat} · {q.type === "tf" ? "True/False" : "Multiple choice"}
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
    const out: Question = { id: d.id, cat: d.cat || "My questions", type: d.type, q: { en: d.q.en.trim(), ms: d.q.ms.trim() }, ans: d.ans, enabled: d.enabled };
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
