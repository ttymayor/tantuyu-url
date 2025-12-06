"use server";

import { getUrlByCode } from "@/lib/url";
import { trackUrlVisit } from "@/lib/analytics";
import { headers } from "next/headers";

export async function verifyPassword(code: string, formData: FormData) {
  const inputPassword = formData.get("password") as string;
  const record = await getUrlByCode(code);

  if (!record) {
    return { error: "網址不存在" };
  }

  if (record.password !== inputPassword) {
    return { error: "密碼不正確" };
  }

  // Password correct. We should record the click now because we are about to redirect.
  await trackUrlVisit(record.id, await headers());

  return { success: true, redirectUrl: record.originalUrl };
}
