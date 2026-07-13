import { redirect } from "next/navigation";
import { KORDIAN_BASE_PATH } from "@/lib/showdemoto/dr-kordian/types";

export default function KordianDemoEntry(): never {
  redirect(`${KORDIAN_BASE_PATH}/en`);
}
