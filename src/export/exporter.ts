import type { Theme } from "../types/theme.ts";
import { serializeTerminal } from "./serializers/terminal.ts";
import { serializeJson } from "./serializers/json.ts";
import { serializeCssVars } from "./serializers/css.ts";
import { copyToClipboard } from "../utils/clipboard.ts";
import { showModal } from "../ui/modal.ts";

export type ExportFormat = "terminal" | "json" | "css";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function shouldShowGuide(): boolean {
  try {
    return localStorage.getItem("exportGuideSuppress") !== "true";
  } catch {
    return true;
  }
}

function showExportGuide(format: ExportFormat): void {
  if (!shouldShowGuide()) return;

  let content: string;
  if (format === "terminal") {
    content = `<div class="export-guide">
<p><strong>How to Import Your Theme</strong></p>
<ol>
<li>Open Terminal.app</li>
<li>Go to Terminal → Settings (⌘,)</li>
<li>Click the "Profiles" tab</li>
<li>Click the gear icon at the bottom</li>
<li>Select "Import..."</li>
<li>Choose your downloaded .terminal file</li>
<li>(Optional) Set as default profile</li>
</ol>
<p class="export-guide-note">Note: Double-clicking the .terminal file may fail because the macOS might think it is dangerous. So use the import option directly.</p>
<label class="export-guide-suppress"><input type="checkbox" id="export-guide-suppress"> Don't show this again</label>
</div>`;
  } else {
    content = `<div class="export-guide">
<p><strong>Your Theme ${format === "json" ? "JSON" : "CSS"}</strong></p>
<p>Your theme has been exported. You can use this file to share your theme or import it into other tools.</p>
<label class="export-guide-suppress"><input type="checkbox" id="export-guide-suppress"> Don't show this again</label>
</div>`;
  }

  const el = document.createElement("div");
  el.innerHTML = content;

  showModal({
    title: "Export Complete",
    content: el,
    closeLabel: "Done",
  });

  // Wire up suppress checkbox
  setTimeout(() => {
    const checkbox = document.getElementById(
      "export-guide-suppress",
    ) as HTMLInputElement | null;
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          try {
            localStorage.setItem("exportGuideSuppress", "true");
          } catch {
            /* ignore */
          }
        } else {
          try {
            localStorage.removeItem("exportGuideSuppress");
          } catch {
            /* ignore */
          }
        }
      });
    }
  }, 50);
}

export function exportTheme(theme: Theme, format: ExportFormat): void {
  const slug = slugify(theme.name) || "theme";

  switch (format) {
    case "terminal": {
      const xml = serializeTerminal(theme);
      const blob = new Blob([xml], { type: "text/xml" });
      downloadBlob(blob, `${slug}.terminal`);
      break;
    }
    case "json": {
      const json = serializeJson(theme);
      const blob = new Blob([json], { type: "application/json" });
      downloadBlob(blob, `${slug}.json`);
      break;
    }
    case "css": {
      void copyCssVars(theme);
      return; // copyCssVars handles its own feedback
    }
  }

  showExportGuide(format);
}

export async function copyCssVars(theme: Theme): Promise<void> {
  const css = serializeCssVars(theme);
  const ok = await copyToClipboard(css);
  if (ok) {
    showModal({
      title: "Copied!",
      content: "CSS variables copied to clipboard.",
      closeLabel: "OK",
    });
    // Auto-close after 1.5s
    setTimeout(() => {
      const modal = document.querySelector(".modal-overlay");
      if (modal) modal.remove();
    }, 1500);
  }
}
