import { getUrlByCode, incrementClicks } from "@/lib/url";
import { redirect } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const code = (await params).code;
  const record = await getUrlByCode(code);

  if (!record) {
    return new Response("Not Found", { status: 404 });
  }

  // 非同步增加點擊次數，不阻塞回應
  incrementClicks(record.id);

  return redirect(record.originalUrl);
}
