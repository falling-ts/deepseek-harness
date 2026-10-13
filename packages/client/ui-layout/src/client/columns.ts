/**
 * Normal column geometry: the right column shrinks, then loses its track,
 * before the center drops below its minimum. The sidebar never concedes here;
 * AppFrame supplies its effective preference after responsive collapse.
 */

/** Resolved widths for one frame. */
export interface Columns { sidebar: number; center: number; rightbar: number }

/** Center width protected while the normal right column is open. */
export const CENTER_MIN = 400
/** Sidebar drag clamp floor. */
export const SIDEBAR_MIN = 264
/** Sidebar drag clamp ceiling. */
export const SIDEBAR_MAX = 420
/** Sidebar width before any user drag. */
export const SIDEBAR_DEFAULT = 280
/** Closed-sidebar rail: a 24px icon column between 16px horizontal paddings. */
export const SIDEBAR_COLLAPSED = 56
/**
 * Frame strip the narrow drawer leaves uncovered. A closed narrow sidebar
 * reserves no track at all, so this edge is what keeps the drawer reading as an
 * overlay: it stays tappable to dismiss, and the conversation keeps its own
 * width behind the panel.
 */
export const SIDEBAR_DRAWER_EDGE_BUDGET = 56
/** Viewport width below which the sidebar becomes a floating drawer: no track
 * in either state, closed renders only the reopen control, and a manual toggle
 * opens the drawer at sidebarDrawerWidth over an undiminished conversation
 * (stores.ts narrowExpanded). */
export const SIDEBAR_AUTO_COLLAPSE = 1024
/** Right column drag clamp floor. */
export const RIGHTBAR_MIN = 300
/** Maximum normal right panel width as a fraction of the frame. */
export const RIGHTBAR_MAX_RATIO = 0.7
/** First-open right panel preference as a fraction of the frame. */
export const RIGHTBAR_DEFAULT_RATIO = 0.45

/**
 * Clamp a panel width into its contract range.
 * @param px - requested width.
 * @param min - range lower bound.
 * @param max - range upper bound.
 * @returns the clamped width.
 */
export function clampWidth(px: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.round(px)))
}

/**
 * Width of the narrow frame's floating sidebar drawer: the widest sidebar the
 * contract allows, shrunk only as far as the frame edge strip requires.
 * @param viewport - available frame width in px.
 * @returns the drawer width in px.
 */
export function sidebarDrawerWidth(viewport: number): number {
  return clampWidth(Math.min(SIDEBAR_MAX, viewport - SIDEBAR_DRAWER_EDGE_BUDGET), SIDEBAR_MIN, SIDEBAR_MAX)
}

/**
 * Solve the three column widths for one viewport frame.
 * @param viewport - available frame width in px.
 * @param sidebar - sidebar width preference in px (0 = closed).
 * @param rightbar - requested right panel width in px (0 = no track).
 * @param collapsedRail - track a closed sidebar reserves: the icon rail on a
 *   wide frame, zero where the closed sidebar floats instead (AppFrame passes 0
 *   on a narrow frame, so the conversation keeps the whole width) or hides it
 *   entirely (macOS desktop).
 * @returns actual widths after shrinking or removing the right track; only
 *   without that track may the center fall below its minimum, down to zero.
 */
export function computeColumns(
  viewport: number,
  sidebar: number,
  rightbar: number,
  collapsedRail: number = SIDEBAR_COLLAPSED,
): Columns {
  const s = sidebar === 0 ? collapsedRail : clampWidth(sidebar, SIDEBAR_MIN, SIDEBAR_MAX)
  const available = viewport - s - CENTER_MIN
  const r = rightbar === 0 || available < RIGHTBAR_MIN
    ? 0
    : Math.min(available, clampWidth(rightbar, RIGHTBAR_MIN, viewport * RIGHTBAR_MAX_RATIO))
  return { sidebar: s, center: Math.max(0, viewport - s - r), rightbar: r }
}
