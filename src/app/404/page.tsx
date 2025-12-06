import { FileQuestion } from "lucide-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default function NotFoundPage() {
  return (
    <div className="bg-muted flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <FlickeringGrid className="absolute inset-0 z-0" />

      <div className="relative z-10">
        <div className="bg-background mx-auto mb-4 w-fit rounded-full p-4">
          <FileQuestion className="text-muted-foreground h-12 w-12" />
        </div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          404 - Page Not Found
        </h1>
        <p className="text-muted-foreground">
          The page or short link you are looking for does not exist or has been
          moved.
        </p>
        <p className="text-muted-foreground">Or the link has expired.</p>
      </div>
    </div>
  );
}
