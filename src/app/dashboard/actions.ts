"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createShortUrl, updateShortUrl, deleteUrl } from "@/lib/url";
import { revalidatePath } from "next/cache";

function isValidUrl(urlString: string) {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateShortCode(code: string): string | null {
  if (!code) return null;

  // 檢查格式：只允許字母、數字、連字號和底線
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return "短代碼只能包含字母、數字、連字號和底線";
  }

  return null;
}

function validateExpiresAt(expiresAtRaw: string): Date | null {
  if (!expiresAtRaw) return null;

  const date = new Date(expiresAtRaw);

  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * 安全地處理錯誤，只返回用戶友好的錯誤消息
 */
function handleError(error: unknown): string {
  // 如果是 Error 實例，檢查是否為已知錯誤
  if (error instanceof Error) {
    const knownErrors = [
      "Short code already in use",
      "URL not found",
      "Unauthorized",
    ];

    if (knownErrors.includes(error.message)) {
      return error.message;
    }

    // 記錄未知錯誤以便調試
    console.error("Unknown error in server action:", error);
    return "操作失敗，請稍後再試";
  }

  // 如果是字符串，直接返回
  if (typeof error === "string") {
    return error;
  }

  // 其他情況，返回通用錯誤消息
  console.error("Unexpected error type in server action:", error);
  return "操作失敗，請稍後再試";
}

export async function shorten(formData: FormData) {
  const url = formData.get("url") as string;
  const customCode = formData.get("customCode") as string;
  const description = formData.get("description") as string;
  const password = formData.get("password") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;

  // 驗證輸入
  if (!url || typeof url !== "string" || url.trim() === "") {
    return { error: "請輸入有效的網址" };
  }

  if (!isValidUrl(url)) {
    return { error: "無效的網址格式，請使用 http:// 或 https:// 開頭" };
  }

  // 驗證自訂代碼
  if (customCode) {
    const codeError = validateShortCode(customCode);
    if (codeError) {
      return { error: codeError };
    }
  }

  // 驗證過期時間
  let expiresAt: Date | undefined;
  if (expiresAtRaw) {
    const validatedDate = validateExpiresAt(expiresAtRaw);
    if (!validatedDate) {
      return { error: "過期時間必須是有效日期" };
    }
    expiresAt = validatedDate;
  }

  // 驗證會話
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "未授權，請先登入" };
  }

  try {
    await createShortUrl(
      url.trim(),
      session.user.id,
      customCode?.trim() || undefined,
      {
        description: description?.trim() || undefined,
        password: password || undefined,
        expiresAt,
      },
    );

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function updateUrlAction(id: string, formData: FormData) {
  const url = formData.get("url") as string;
  const shortCode = formData.get("shortCode") as string;
  const description = formData.get("description") as string;
  const password = formData.get("password") as string;
  const expiresAtRaw = formData.get("expiresAt") as string;

  // 驗證輸入
  if (!id || typeof id !== "string") {
    return { error: "無效的 URL ID" };
  }

  if (!url || typeof url !== "string" || url.trim() === "") {
    return { error: "請輸入有效的網址" };
  }

  if (!shortCode || typeof shortCode !== "string" || shortCode.trim() === "") {
    return { error: "請輸入有效的短代碼" };
  }

  if (!isValidUrl(url)) {
    return { error: "無效的網址格式，請使用 http:// 或 https:// 開頭" };
  }

  // 驗證短代碼
  const codeError = validateShortCode(shortCode.trim());
  if (codeError) {
    return { error: codeError };
  }

  // 驗證過期時間
  let expiresAt: Date | null = null;
  if (expiresAtRaw) {
    const validatedDate = validateExpiresAt(expiresAtRaw);
    if (!validatedDate) {
      return { error: "過期時間必須是未來的有效日期" };
    }
    expiresAt = validatedDate;
  }

  // 驗證會話
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "未授權，請先登入" };
  }

  try {
    await updateShortUrl(id, session.user.id, {
      originalUrl: url.trim(),
      shortCode: shortCode.trim(),
      description: description?.trim() || null,
      password: password || null,
      expiresAt,
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}

export async function deleteUrlAction(id: string) {
  if (!id || typeof id !== "string") {
    return { error: "無效的 URL ID" };
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "未授權，請先登入" };
  }

  try {
    await deleteUrl(id, session.user.id);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: handleError(error) };
  }
}
