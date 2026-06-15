const fs = require('fs');

const file1 = '/Users/yasser/Downloads/harbor-main newUpdate/src/views/detail/series-episode-row.tsx';
let c1 = fs.readFileSync(file1, 'utf8');

c1 = c1.replace(/import \{ Check, Play \} from "lucide-react";/, 'import { CalendarClock, Check, Play } from "lucide-react";');

const target1 = `<div className="relative w-\\[200px\\] shrink-0 overflow-hidden rounded-lg">
          <div className={spoiler\\?\\.thumb \\? SPOILER_THUMB_CLASS : undefined}>
            <Poster
              src={still}
              seed={String\\(ep\\.id\\)}
              ratio="landscape"
              onError={.*?}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-canvas/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-canvas">
              <Play size={18} fill="currentColor" />
            </div>
          </div>`;

const replacement1 = `const isUpcoming = isUpcomingEpisode(ep);
  return (
    <div
      data-ep={ep.episodeNumber}
      data-no-card-ring
      onContextMenu={(e) => onContextMenu?.(e, ep.seasonNumber, ep.episodeNumber, progress.watched)}
      className={\`group flex gap-6 rounded-2xl px-4 py-5 transition-colors \${isUpcoming ? "opacity-75 hover:bg-elevated/30" : "hover:bg-elevated/30"}\`}
    >
      <button
        onClick={() => openPicker(meta, playEpisode, { autoPlay: settings.instantPlay })}
        className="flex min-w-0 flex-1 gap-6 text-start"
      >
        <div className="relative w-[200px] shrink-0 overflow-hidden rounded-lg">
          {isUpcoming ? (
            <div className="flex aspect-[16/9] w-full flex-col items-center justify-center bg-canvas/60 text-ink-subtle">
              <CalendarClock size={28} strokeWidth={1.5} />
            </div>
          ) : (
            <div className={spoiler?.thumb ? SPOILER_THUMB_CLASS : undefined}>
              <Poster
                src={still}
                seed={String(ep.id)}
                ratio="landscape"
                onError={() => setImgIdx((i) => i + 1)}
              />
            </div>
          )}
          {!isUpcoming && (
            <div className="absolute inset-0 flex items-center justify-center bg-canvas/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-canvas">
                <Play size={18} fill="currentColor" />
              </div>
            </div>
          )}`;

c1 = c1.replace(/return \([\s\S]*?<div className="relative w-\[200px\] shrink-0 overflow-hidden rounded-lg">[\s\S]*?<Play size=\{18\} fill="currentColor" \/>\s*<\/div>\s*<\/div>/, replacement1);

fs.writeFileSync(file1, c1, 'utf8');

const file2 = '/Users/yasser/Downloads/harbor-main newUpdate/src/views/detail/cinemeta-episodes.tsx';
let c2 = fs.readFileSync(file2, 'utf8');

c2 = c2.replace(/import \{ ChevronDown, Play \} from "lucide-react";/, 'import { CalendarClock, ChevronDown, Play } from "lucide-react";');
c2 = c2.replace(/import \{ EpisodeDownloadButton \} from "\.\/episode-download-button";/, 'import { EpisodeDownloadButton } from "./episode-download-button";\nimport { isUpcomingDate } from "./helpers";');

const replacement2 = `const isUpcoming = isUpcomingDate(aired);
  return (
    <div
      data-no-card-ring
      className={\`group flex items-center gap-4 rounded-2xl px-4 py-5 transition-colors \${isUpcoming ? "opacity-75 hover:bg-elevated/30" : "hover:bg-elevated/30"}\`}
    >
      <button
        onClick={() => openPicker(meta, playEpisode, { autoPlay: settings.instantPlay })}
        className="flex min-w-0 flex-1 gap-6 text-start"
      >
        <div className="relative w-[200px] shrink-0 overflow-hidden rounded-lg">
          {isUpcoming ? (
            <div className="flex aspect-[16/9] w-full flex-col items-center justify-center bg-canvas/60 text-ink-subtle">
              <CalendarClock size={28} strokeWidth={1.5} />
            </div>
          ) : (
            <Poster
              src={ep.thumbnail}
              seed={ep.id ?? \`\${meta.id}-\${ep.season}-\${epNumber}\`}
              ratio="landscape"
            />
          )}
          {!isUpcoming && (
            <div className="absolute inset-0 flex items-center justify-center bg-canvas/40 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-canvas">
                <Play size={18} fill="currentColor" />
              </div>
            </div>
          )}`;

c2 = c2.replace(/return \([\s\S]*?<div className="relative w-\[200px\] shrink-0 overflow-hidden rounded-lg">[\s\S]*?<Play size=\{18\} fill="currentColor" \/>\s*<\/div>\s*<\/div>/, replacement2);

fs.writeFileSync(file2, c2, 'utf8');

