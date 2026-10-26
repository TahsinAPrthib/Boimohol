import { seededRandom, type CoverDesign } from "@/lib/cover-design";

// The ornament of a generated cover: one small SVG in the cover's own
// coordinates (200 x 300, the 2:3 frame), drawn in currentColor so the
// cover's CSS variables colour it. Each category has its own visual
// language; the book's seed varies it. Kept to a few paths per cover, so a
// page of 48 covers stays light. Decorative only.

const r1 = (n: number) => Math.round(n * 10) / 10;
// A dot of the stroke's width: a zero-length line with round caps.
const dots = (pts: [number, number][]) => pts.map(([x, y]) => `M${r1(x)} ${r1(y)}h0`).join("");
const polar = (cx: number, cy: number, r: number, a: number): [number, number] => [r1(cx + r * Math.cos(a)), r1(cy + r * Math.sin(a))];

// The four corners of a frame, each with the same ornament turned inward.
function Corners({ d, x0, y0, x1, y1, fill }: { d: string; x0: number; y0: number; x1: number; y1: number; fill?: boolean }) {
  const at = [
    `translate(${x0} ${y0})`,
    `translate(${x1} ${y0}) scale(-1 1)`,
    `translate(${x0} ${y1}) scale(1 -1)`,
    `translate(${x1} ${y1}) scale(-1 -1)`,
  ];
  return (
    <g fill={fill ? "currentColor" : undefined}>
      {at.map((t) => (
        <path key={t} d={d} transform={t} />
      ))}
    </g>
  );
}

// কবিতা: a double ruled frame with corner flourishes, as on a gift edition.
function Poetry({ v }: { v: number }) {
  const corner = [
    "M2 30C2 13 13 2 30 2M2 17C9 17 17 9 17 2M8 8h0",
    "M2 2C14 3 23 11 25 25C11 23 3 14 2 2ZM2 2L19 19",
    "M12 0L20 8L12 16L4 8ZM20 8H42M12 16V38",
  ][v];
  return (
    <>
      <rect x="17" y="12" width="172" height="276" strokeWidth="1.4" />
      <rect x="22" y="17" width="162" height="266" strokeWidth=".5" />
      <g strokeWidth="1.1" strokeLinecap="round">
        <Corners d={corner} x0={22} y0={17} x1={184} y1={283} fill={v === 1} />
      </g>
    </>
  );
}

// উপন্যাস: a cloth binding -- bands across head and tail, a blind-stamped
// panel; the title sits on a label (the plate, in CSS).
function Novel({ v }: { v: number }) {
  return (
    <>
      <path d="M10 22H200M10 26H200M10 274H200M10 278H200" strokeWidth={v === 1 ? 1.6 : 0.8} />
      {v === 0 && <rect x="24" y="40" width="158" height="220" rx="4" strokeWidth=".7" opacity=".55" />}
      {v === 1 && <path d="M24 34h158M24 266h158" strokeWidth="3" strokeLinecap="round" strokeDasharray="0 7" opacity=".7" />}
      {v === 2 && (
        <g opacity=".55" strokeWidth=".7">
          <path d="M34 40H172L182 50V250L172 260H34L24 250V50Z" />
          <path d="M38 45H168L177 54V246L168 255H38L29 246V54Z" />
        </g>
      )}
    </>
  );
}

// প্রবন্ধ: plain paper, a solid band or a single rule, nothing else.
function Essay({ v }: { v: number }) {
  if (v === 0) return <rect x="0" y="0" width="200" height="56" fill="currentColor" stroke="none" />;
  if (v === 1) return <rect x="0" y="246" width="200" height="54" fill="currentColor" stroke="none" />;
  return (
    <>
      <rect x="22" y="14" width="164" height="272" strokeWidth=".6" />
      <rect x="34" y="34" width="34" height="4" fill="currentColor" stroke="none" />
    </>
  );
}

// রহস্য ও থ্রিলার: a red band slashed across the dark cloth, and a keyhole,
// a magnifying glass or a trail of footprints.
function Thriller({ v, rand, top }: { v: number; rand: () => number; top: boolean }) {
  const y = 150 + rand() * 50;
  const rise = 50 + rand() * 40;
  const cx = 70 + rand() * 90;
  // The motif opposite the title.
  const cy = top ? 228 + rand() * 30 : 62 + rand() * 30;
  return (
    <>
      <path d={`M0 ${r1(y)}L200 ${r1(y - rise)}V${r1(y - rise + 44)}L0 ${r1(y + 44)}Z`} fill="#7C2D2D" stroke="none" opacity=".92" />
      {v === 0 && (
        <path
          d={`M${r1(cx - 6)} ${r1(cy + 7)}A11 11 0 1 1 ${r1(cx + 6)} ${r1(cy + 7)}L${r1(cx + 9)} ${r1(cy + 34)}H${r1(cx - 9)}Z`}
          fill="currentColor"
          stroke="none"
          opacity=".22"
        />
      )}
      {v === 1 && (
        <g opacity=".3" strokeLinecap="round">
          <circle cx={r1(cx)} cy={r1(cy)} r="20" strokeWidth="5" />
          <path d={`M${r1(cx + 15)} ${r1(cy + 15)}l22 22`} strokeWidth="8" />
        </g>
      )}
      {v === 2 && (
        <path
          d={dots(Array.from({ length: 6 }, (_, i) => [30 + i * 26, (top ? 286 : 140) - i * 22 + (i % 2) * 10] as [number, number]))}
          strokeWidth="8"
          strokeLinecap="round"
          opacity=".25"
        />
      )}
    </>
  );
}

// বিজ্ঞান কল্পকাহিনি: a night sky -- a field of stars with a few bright
// ones -- and tilted orbits round a ringed planet.
function SciFi({ rand, top }: { rand: () => number; top: boolean }) {
  // Faint stars anywhere; the bright ones and the sparkles on the side away
  // from the title, where they can't be mistaken for marks on its letters.
  const [y0, y1] = top ? [165, 290] : [10, 135];
  const stars: [number, number][] = Array.from({ length: 26 }, (_, i) => [14 + rand() * 180, i < 18 ? 6 + rand() * 288 : y0 + rand() * (y1 - y0)]);
  let sparkles = "";
  for (let i = 0; i < 3; i++) {
    const x = r1(20 + rand() * 166);
    const y = r1(y0 + rand() * (y1 - y0));
    const s = 4 + rand() * 3;
    const q = r1(s * 0.22);
    sparkles += `M${x} ${r1(y - s)}L${r1(x + q)} ${r1(y - q)}L${r1(x + s)} ${y}L${r1(x + q)} ${r1(y + q)}L${x} ${r1(y + s)}L${r1(x - q)} ${r1(y + q)}L${r1(x - s)} ${y}L${r1(x - q)} ${r1(y - q)}Z`;
  }
  const cx = r1(75 + rand() * 50);
  const cy = r1(top ? 205 + rand() * 30 : 80 + rand() * 30);
  const tilt = (-25 + rand() * 50) * (Math.PI / 180);
  const t = rand() * Math.PI * 2;
  // The planet on the middle orbit, turned with the orbits.
  const ox = 50 * Math.cos(t);
  const oy = 16 * Math.sin(t);
  const px = r1(cx + ox * Math.cos(tilt) - oy * Math.sin(tilt));
  const py = r1(cy + ox * Math.sin(tilt) + oy * Math.cos(tilt));
  const deg = r1((tilt * 180) / Math.PI);
  return (
    <>
      <path d={dots(stars.slice(0, 18))} strokeWidth="1.3" strokeLinecap="round" opacity=".7" />
      <path d={dots(stars.slice(18))} strokeWidth="2.6" strokeLinecap="round" opacity=".5" />
      <path d={sparkles} fill="currentColor" stroke="none" opacity=".85" />
      <g transform={`rotate(${deg} ${cx} ${cy})`} strokeWidth="1.1" opacity=".5">
        <ellipse cx={cx} cy={cy} rx="28" ry="9" />
        <ellipse cx={cx} cy={cy} rx="50" ry="16" />
        <ellipse cx={cx} cy={cy} rx="74" ry="24" />
      </g>
      <circle cx={px} cy={py} r="7" fill="var(--cv-acc)" stroke="none" />
      <ellipse cx={px} cy={py} rx="12" ry="3.5" transform={`rotate(${deg} ${px} ${py})`} stroke="var(--cv-acc)" strokeWidth="1.2" />
    </>
  );
}

// আত্ম-উন্নয়ন: a rising sun with rays, or steps climbing to the right.
function SelfHelp({ v }: { v: number }) {
  if (v === 2) {
    return <path d="M10 300V268H52V236H94V204H136V172H178V140H200V300Z" fill="currentColor" stroke="none" opacity=".13" />;
  }
  const cx = v === 0 ? 103 : 30;
  const n = v === 0 ? 18 : 14;
  const span = v === 0 ? Math.PI : Math.PI / 2;
  const start = v === 0 ? Math.PI : (3 * Math.PI) / 2;
  let rays = "";
  for (let i = 0; i < n; i += 2) {
    const a = start + (span * i) / n;
    const b = start + (span * (i + 1)) / n;
    const [x1, y1] = polar(cx, 300, 380, a);
    const [x2, y2] = polar(cx, 300, 380, b);
    rays += `M${cx} 300L${x1} ${y1}L${x2} ${y2}Z`;
  }
  return (
    <>
      <path d={rays} fill="currentColor" stroke="none" opacity=".09" />
      <circle cx={cx} cy="300" r="54" fill="currentColor" stroke="none" opacity=".14" />
      <circle cx={cx} cy="300" r="42" strokeWidth="1.2" opacity=".35" />
    </>
  );
}

// ইতিহাস ও জীবনী: a cameo -- an oval, an arched window or a shield -- with
// the book's initial in it (the glyph, placed by CSS), flanked by rules.
function History({ v }: { v: number }) {
  const outer = [
    "M100 52a44 56 0 1 1 0 112a44 56 0 1 1 0-112Z",
    "M58 166V96a42 42 0 0 1 84 0V166Z",
    "M60 56H140V104C140 138 122 156 100 166C78 156 60 138 60 104Z",
  ][v];
  const inner = [
    "M100 57a39 51 0 1 1 0 102a39 51 0 1 1 0-102Z",
    "M63 161V96a37 37 0 0 1 74 0V161Z",
    "M65 61H135V104C135 134 119 150 100 159C81 150 65 134 65 104Z",
  ][v];
  return (
    <>
      <path d={outer} strokeWidth="1.6" />
      <path d={inner} strokeWidth=".6" />
      <path d="M20 110H48M152 110H186" strokeWidth=".8" />
      <path d="M52 110l4-4 4 4-4 4ZM144 110l4-4 4 4-4 4Z" fill="currentColor" stroke="none" />
    </>
  );
}

// ছোটগল্প: a sampler of small tiles -- many stories in one book -- in a
// pattern of the book's own.
function Stories({ v, rand, top }: { v: number; rand: () => number; top: boolean }) {
  const cols = v === 2 ? 4 : 3;
  const rows = 3;
  const s = cols === 3 ? 20 : 15;
  const g = cols === 3 ? 9 : 7;
  const w = cols * s + (cols - 1) * g;
  const x0 = 104 - w / 2;
  const y0 = top ? 30 : 288 - (rows * s + (rows - 1) * g);
  let filled = "";
  let open = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = r1(x0 + c * (s + g));
      const y = r1(y0 + r * (s + g));
      const shape =
        v === 1
          ? `M${x} ${r1(y + s / 2)}a${s / 2} ${s / 2} 0 1 0 ${s} 0a${s / 2} ${s / 2} 0 1 0 ${-s} 0Z`
          : v === 2 && rand() < 0.4
            ? `M${x} ${y}h${s}L${x} ${r1(y + s)}Z`
            : `M${x} ${y}h${s}v${s}h${-s}Z`;
      if (rand() < 0.5) filled += shape;
      else open += shape;
    }
  }
  return (
    <>
      <path d={filled} fill="currentColor" stroke="none" opacity=".8" />
      <path d={open} strokeWidth="1.2" opacity=".6" />
    </>
  );
}

// ভ্রমণকাহিনি: contour lines, a dotted route and a compass rose.
function Travel({ rand, top }: { rand: () => number; top: boolean }) {
  const cx = 70 + rand() * 70;
  const cy = top ? 205 + rand() * 30 : 90 + rand() * 30;
  const tilt = r1(rand() * 60 - 30);
  const [sx, sy] = [26 + rand() * 20, top ? 285 : 150];
  const [ex, ey] = [150 + rand() * 30, top ? 150 : 22 + rand() * 20];
  const route = `M${r1(sx)} ${sy}C${r1(sx + 60)} ${r1(sy - 30 - rand() * 40)} ${r1(ex - 70)} ${r1(ey + 40 + rand() * 30)} ${r1(ex)} ${r1(ey)}`;
  // The compass in the corner left free by the title and the route's end.
  const rx = top ? 168 : 40;
  const ry = top ? 262 : 40;
  return (
    <>
      <g transform={`rotate(${tilt} ${r1(cx)} ${r1(cy)})`} strokeWidth=".8" opacity=".38">
        {[22, 36, 50, 64].map((rad, i) => (
          <ellipse key={rad} cx={r1(cx + i * 2)} cy={r1(cy - i)} rx={rad} ry={r1(rad * 0.66)} />
        ))}
      </g>
      <path d={route} strokeWidth="1.6" strokeDasharray="4 4" opacity=".75" />
      <circle cx={r1(ex)} cy={r1(ey)} r="3.5" fill="currentColor" stroke="none" />
      <path d={`M${rx} ${ry - 13}l3 10 10 3-10 3-3 10-3-10-10-3 10-3Z`} fill="currentColor" stroke="none" opacity=".85" />
    </>
  );
}

// শিশুসাহিত্য: bright shapes tumbling round a title card.
const PLAY_COLORS = ["#7C2D2D", "#253F54", "#5F7355", "#EAE3D3", "#2A2420"];
function Children({ rand }: { rand: () => number }) {
  const zones = [
    [16, 12, 90, 70],
    [110, 12, 186, 70],
    [16, 222, 90, 288],
    [110, 222, 186, 288],
    [16, 90, 40, 210],
    [166, 90, 192, 210],
  ];
  return (
    <g stroke="none">
      {zones.map(([x0, y0, x1, y1], i) => {
        const x = r1(x0 + rand() * (x1 - x0));
        const y = r1(y0 + rand() * (y1 - y0));
        const color = PLAY_COLORS[Math.floor(rand() * PLAY_COLORS.length)];
        const kind = (i + Math.floor(rand() * 4)) % 4;
        const s = 7 + rand() * 6;
        if (kind === 0) return <circle key={i} cx={x} cy={y} r={r1(s)} fill={color} />;
        if (kind === 1) {
          let d = "";
          for (let k = 0; k < 10; k++) {
            const [px, py] = polar(x, y, k % 2 ? s * 0.45 : s * 1.2, -Math.PI / 2 + (k * Math.PI) / 5);
            d += `${k ? "L" : "M"}${px} ${py}`;
          }
          return <path key={i} d={`${d}Z`} fill={color} />;
        }
        if (kind === 2) return <path key={i} d={`M${x} ${r1(y - s)}l${r1(s)} ${r1(s * 1.7)}h${r1(-2 * s)}Z`} fill={color} />;
        return (
          <path key={i} d={`M${r1(x - 14)} ${y}q4-6 7 0t7 0 7 0 7 0`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        );
      })}
    </g>
  );
}

// পুরাণ ও লোককথা: an alpana lotus, and a border of kantha running stitch.
function Myth({ v }: { v: number }) {
  const n = [8, 10, 12][v];
  const cx = 103;
  const cy = 96;
  let petals = "";
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const w = Math.PI / n;
    const [x0, y0] = polar(cx, cy, 12, a);
    const [xl, yl] = polar(cx, cy, 34, a - w);
    const [xt, yt] = polar(cx, cy, 46, a);
    const [xr, yr] = polar(cx, cy, 34, a + w);
    petals += `M${x0} ${y0}Q${xl} ${yl} ${xt} ${yt}Q${xr} ${yr} ${x0} ${y0}Z`;
  }
  return (
    <>
      <rect x="16" y="10" width="174" height="280" strokeWidth=".9" strokeDasharray={v === 2 ? "0 5" : "6 4"} strokeLinecap="round" />
      {v === 1 && <rect x="21" y="15" width="164" height="270" strokeWidth=".6" strokeDasharray="2 5" />}
      <path d={petals} fill="currentColor" fillOpacity=".2" strokeWidth=".9" />
      <circle cx={cx} cy={cy} r="9" fill="currentColor" stroke="none" />
      <circle cx={cx} cy={cy} r="54" strokeWidth="2.2" strokeDasharray="0 6.5" strokeLinecap="round" />
    </>
  );
}

// নাটক: a proscenium -- a scalloped valance and drawn-back curtains -- and
// the boards of the stage.
function Drama({ v }: { v: number }) {
  const n = [3, 4, 5][v];
  const w = 190 / n;
  let valance = "M10 12H200V30";
  for (let k = 0; k < n; k++) {
    const x = 200 - k * w;
    valance += `Q${r1(x - w / 2)} 46 ${r1(x - w)} 30`;
  }
  const drape = v === 1 ? "M10 30C30 96 30 190 34 262H10Z" : "M10 30C30 62 36 118 26 146C36 184 42 226 46 262H10Z";
  return (
    <>
      <path d={drape} fill="currentColor" stroke="none" opacity=".2" />
      <path d={drape} transform="translate(210 0) scale(-1 1)" fill="currentColor" stroke="none" opacity=".2" />
      <path d={`${valance}Z`} fill="currentColor" stroke="none" opacity=".88" />
      <path d="M10 262H200M44 300L70 262M106 300V262M168 300L142 262" strokeWidth=".8" opacity=".5" />
    </>
  );
}

export default function CoverArt({ design }: { design: CoverDesign }) {
  const { family, variant: v, layout } = design;
  if (family === "classic") return null;
  // A fresh generator per cover, after the draws coverDesign made.
  const rand = seededRandom(design.seed ^ 0x9e3779b9);
  const top = layout === "top" || layout === "top-c";
  const art =
    family === "poetry" ? <Poetry v={v} />
    : family === "novel" ? <Novel v={v} />
    : family === "essay" ? <Essay v={v} />
    : family === "thriller" ? <Thriller v={v} rand={rand} top={top} />
    : family === "scifi" ? <SciFi rand={rand} top={top} />
    : family === "selfhelp" ? <SelfHelp v={v} />
    : family === "history" ? <History v={v} />
    : family === "stories" ? <Stories v={v} rand={rand} top={!top} />
    : family === "travel" ? <Travel rand={rand} top={top} />
    : family === "children" ? <Children rand={rand} />
    : family === "myth" ? <Myth v={v} />
    : <Drama v={v} />;
  return (
    <svg className="cover-art" viewBox="0 0 200 300" preserveAspectRatio="none" fill="none" stroke="currentColor" aria-hidden="true">
      {art}
    </svg>
  );
}
