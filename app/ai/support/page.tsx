"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { IconPhone, IconPlus, IconX } from "../icons";

type TicketSummary = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  replied_at: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  open: "باز",
  answered: "پاسخ داده شد",
  closed: "بسته",
};

const STATUS_CLASS: Record<string, string> = {
  open: "open",
  answered: "answered",
  closed: "closed",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function SupportPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const loadTickets = useCallback(() => {
    return fetch("/api/ai/support/tickets", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setTickets(d.tickets || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/ai/auth", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        setAuthed(!!d.authed);
        if (d.authed) loadTickets();
        else setLoading(false);
      })
      .catch(() => {
        setAuthed(false);
        setLoading(false);
      });
  }, [loadTickets]);

  async function submitTicket(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setErr("");

    const s = subject.trim();
    const b = body.trim();
    if (!s || !b) {
      setErr("موضوع و متن تیکت را وارد کن.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/ai/support/tickets", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: s, body: b }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        window.dispatchEvent(new Event("ai:open-login"));
        setSubmitting(false);
        return;
      }
      if (!res.ok || !data?.ok) {
        setErr("ثبت تیکت ناموفق بود. دوباره تلاش کن.");
        setSubmitting(false);
        return;
      }

      setSubject("");
      setBody("");
      setShowForm(false);
      await loadTickets();
      if (data.ticket?.id) {
        window.location.href = `/ai/support/${data.ticket.id}`;
      }
    } catch {
      setErr("خطایی پیش آمد. دوباره تلاش کن.");
    }
    setSubmitting(false);
  }

  function openLogin() {
    window.dispatchEvent(new Event("ai:open-login"));
  }

  return (
    <main className="ar-container ar-support-page">
      <div className="ar-support-hero">
        <IconPhone size={28} />
        <h1>پشتیبانی</h1>
        <p>سوال یا مشکلت را بنویس — تیم ما در اسرع وقت پاسخ می‌دهد.</p>
      </div>

      {authed === false && (
        <div className="ar-banner error" style={{ marginBottom: 20 }}>
          <IconX size={14} />
          برای ثبت و پیگیری تیکت باید وارد حسابت شوی.{" "}
          <button type="button" className="ar-link-btn" onClick={openLogin}>
            ورود / ثبت‌نام
          </button>
        </div>
      )}

      {authed && (
        <div className="ar-support-toolbar">
          <button
            type="button"
            className="ar-btn ar-btn-primary ar-btn-sm"
            onClick={() => setShowForm((v) => !v)}
          >
            <IconPlus size={14} />
            {showForm ? "انصراف" : "تیکت جدید"}
          </button>
        </div>
      )}

      {showForm && authed && (
        <form className="ar-support-form" onSubmit={submitTicket}>
          <div className="ar-field">
            <label htmlFor="ticket-subject">موضوع</label>
            <input
              id="ticket-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثلاً مشکل در پرداخت"
              dir="rtl"
              style={{ direction: "rtl", textAlign: "right" }}
              maxLength={200}
            />
          </div>
          <div className="ar-field">
            <label htmlFor="ticket-body">پیام</label>
            <textarea
              id="ticket-body"
              className="ar-support-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="مشکل یا سوالت را با جزئیات بنویس…"
              rows={5}
              maxLength={4000}
            />
          </div>
          {err && <div className="ar-auth-err">{err}</div>}
          <button
            type="submit"
            className="ar-btn ar-btn-primary ar-btn-block"
            disabled={submitting}
          >
            {submitting ? "در حال ارسال…" : "ارسال تیکت"}
          </button>
        </form>
      )}

      {loading ? (
        <div className="ar-loading-note">
          <span className="ar-spinner" />
          در حال بارگذاری…
        </div>
      ) : authed && tickets.length === 0 ? (
        <div className="ar-support-empty">
          هنوز تیکتی ثبت نکردی.
          <br />
          <button
            type="button"
            className="ar-btn ar-btn-ghost"
            style={{ marginTop: 16 }}
            onClick={() => setShowForm(true)}
          >
            اولین تیکت را بساز
          </button>
        </div>
      ) : authed ? (
        <div className="ar-support-list">
          {tickets.map((t) => (
            <Link key={t.id} href={`/ai/support/${t.id}`} className="ar-support-item">
              <div className="ar-support-item-head">
                <span className="ar-support-item-subject">{t.subject}</span>
                <span className={`ar-support-badge ${STATUS_CLASS[t.status] || ""}`}>
                  {STATUS_LABELS[t.status] || t.status}
                </span>
              </div>
              <div className="ar-support-item-meta">{formatDate(t.created_at)}</div>
            </Link>
          ))}
        </div>
      ) : null}

      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Link href="/ai" className="ar-btn ar-btn-ghost">
          بازگشت به Arena
        </Link>
      </div>
    </main>
  );
}
