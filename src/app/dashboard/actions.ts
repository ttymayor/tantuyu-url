"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createShortUrl, updateShortUrl } from "@/lib/url";
import { revalidatePath } from "next/cache";

function isValidUrl(urlString: string) {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
}

export async function shorten(prevState: any, formData: FormData) {
    const url = formData.get("url") as string;
    const customCode = formData.get("customCode") as string;
    
    if (!url) return { error: "URL is required" };
    if (!isValidUrl(url)) return { error: "Invalid URL format" };

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) return { error: "Unauthorized" };

    try {
        await createShortUrl(url, session.user.id, customCode || undefined);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function updateUrlAction(id: string, formData: FormData) {
    const url = formData.get("url") as string;
    const shortCode = formData.get("shortCode") as string;
    
    if (!url || !shortCode) return { error: "URL and Short Code are required" };
    if (!isValidUrl(url)) return { error: "Invalid URL format" };

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) return { error: "Unauthorized" };

    try {
        await updateShortUrl(id, session.user.id, { originalUrl: url, shortCode });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
