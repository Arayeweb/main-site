"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconPhone } from "../../icons";

type TicketDetail = {
  id: string;
  subject: string;
  body: string;
  status: string;
  priority: string;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  open: "باز",
  answered: "پاسخ داده شد",
  closed: "بسته",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "کم",
  normal: "عادی",
  high: "بالا",
};

const STATUS_CLASS: Record<string, string> = {
  open: "open",
  answered: "answered",
  closed: "closed",
};

function formatDate(iso: string | null) {
  if (!iso) return "";
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

export default function SupportTicketPage() {
  const params = useParams();
  const id = params?.id as string;
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/ai/support/tickets/${id}`, { credentials: "same-origin" })
      .then((r) => {
        if (r.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        if (r.status === 401) {
          window.dispatchEvent(new Event("ai:open-login"));
          setLoading(false);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.ok) setTicket(d.ticket);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <main className="ar-container ar-support-page">
      <div className="ar-support-hero">
        <IconPhone size={24} />
        <h1>جزئیات تیکت</h1>
      </div>

      <Link href="/ai/support" className="ar-support-back">
        ← بازگشت به لیست تیکت‌ها
      </Link>

      {loading ? (
        <div className="ar-loading-note">
          <span className="ar-spinner" />
          در حال بارگذاری…
        </div>
      ) : notFound ? (
        <div className="ar-support-empty">تیکت پیدا نشد.</div>
      ) : ticket ? (
        <div className="ar-support-detail">
          <div className="ar-support-detail-head">
            <h2>{ticket.subject}</h2>
            <div className="ar-support-detail-badges">
              <span className={`ar-support-badge ${STATUS_CLASS[ticket.status] || ""}`}>
                {STATUS_LABELS[ticket.status] || ticket.status}
              </span>
              <span className="ar-support-badge priority">
                {PRIORITY_LABELS[ticket.priority] || ticket.priority}
              </span>
            </div>
          </div>
          <div className="ar-support-detail-meta">
            ثبت: {formatDate(ticket.created_at)}
          </div>

          <div className="ar-support-message user">
            <div className="ar-support-message-label">پیام شما</div>
            <p>{ticket.body}</p>
          </div>

          {ticket.admin_reply && (
            <div className="ar-support-message admin">
              <div className="ar-support-message-label">
                پاسخ پشتیبانی
                {ticket.replied_at && (
                  <span className="ar-support-reply-date">
                    {formatDate(ticket.replied_at)}
                  </span>
                )}
              </div>
              <p>{ticket.admin_reply}</p>
            </div>
          )}

          {ticket.status === "open" && !ticket.admin_reply && (
            <p className="ar-support-waiting">
              تیکت در صف بررسی است — به محض پاسخ، اینجا نمایش داده می‌شود.
            </p>
          )}
        </div>
      ) : null}
    </main>
  );
}
