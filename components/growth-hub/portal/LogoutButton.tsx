"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutAction } from "@/lib/growth-hub/actions/auth";
import styles from "../growth-hub.module.css";

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await signOutAction();
      router.replace("/app/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      className={styles.logoutButton}
      onClick={handleLogout}
      disabled={pending}
    >
      <LogOut size={15} aria-hidden="true" />
      <span>{pending ? "در حال خروج…" : "خروج از حساب"}</span>
    </button>
  );
}
