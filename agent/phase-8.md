# Phase 8: Polish

> **Prerequisites**: Phase 7 (Additional Features) must be complete
> **Read first**: `agent/PLAN.md` for full project context
> **After completing**: Update `STATUS.md` Phase 8 to ✅ and set "Current Phase" to "Complete"

## Overview

Final polish pass: match the mockup precisely, add transitions/animations, test all features end-to-end, fix edge cases, and ensure production-quality output.

## Before You Start

1. Ensure `npm run dev` is running
2. Have `theme-builder-mockup.jpeg` open for side-by-side comparison
3. Check `STATUS.md` confirms Phase 7 is ✅

## Tasks

### 8.1 Visual QA Against Mockup

Open the app and the mockup side by side. Fix any discrepancies:

- **Header**: Font weight, size, letter-spacing match mockup
- **Palette strip cards**: Correct dimensions, rounded corners, border style, color dot sizes, text truncation
- **Active card**: Dashed/highlighted border matches mockup style
- **Scenario tabs**: Size, padding, active tab treatment (filled background)
- **Terminal window**: Traffic light dot colors and sizes, corner radius, title bar text styling, content font size, line spacing
- **Speed control**: Button styling, font, spacing matches mockup
- **Right panel**: Section label typography (small caps, letter-spacing), swatch sizes, spacing between sections
- **Color swatches**: Core color cards (Background, Text, Bold, Selected) — correct proportions, labels, hex display
- **ANSI swatch rows**: Round swatches, correct spacing, hover tooltip positioning
- **Overall spacing**: Margins, padding, section gaps match mockup proportions
- **Background color**: The app's page background should be very dark, near-black

### 8.2 Transitions and Animations

Add smooth transitions where appropriate:

- **Theme switch**: CSS variable transitions for color changes (`transition: color 0.3s, background-color 0.3s`)
- **Palette card hover**: Subtle brightness/scale increase (`transform: scale(1.02)`, `brightness(1.1)`)
- **Active card**: Border transition
- **Swatch hover**: Scale up (`transform: scale(1.15)`) with ease
- **"Copied!" tooltip**: Fade in, hold, fade out (`opacity` transition + setTimeout)
- **Custom builder enter/exit**: Slide/fade transition for the builder UI
- **Modal**: Fade in backdrop, slide up content
- **Ambient background**: Already has `transition: background 0.6s ease` (from Phase 1)
- **Slider thumbs**: Smooth color feedback as you drag
- **Comparison slider bar**: Smooth drag (should already be smooth from pointer events)

**Don't over-animate**: Keep transitions subtle (200–400ms). The mockup has a calm, professional aesthetic — no bouncy or flashy animations.

### 8.3 Theme Quality Check

For each of the 16 themes:
1. Select the theme
2. Verify all ANSI colors are distinct and readable against the background
3. Check that the terminal preview looks good — colors should feel cohesive
4. Verify WCAG contrast for text-on-background is at least AA (4.5:1)
5. Check that bold text is visually distinguishable from regular text
6. Verify selection color is visible but not overwhelming
7. Adjust any colors that don't meet these criteria

### 8.4 Custom Builder Edge Cases

Test and fix:
- **Extreme slider values**: Hue at 0 and 360 should produce the same result (wrap). Saturation at 0 should produce near-grayscale. Contrast at 0 should be low-contrast (still readable). Contrast at 1 should be high-contrast.
- **Out-of-gamut colors**: The OKLCH→hex conversion should clamp gracefully — no NaN, no undefined, no black-screen. Test with high chroma + extreme hues.
- **Pin all colors, move slider**: Nothing should change. Unpin one → only that one changes.
- **Lock/unlock rapid toggling**: No state corruption.
- **Empty theme name**: Default to "Custom Theme" if the name input is empty.
- **Very long theme name**: Truncate in UI, allow full name in export.

### 8.5 Export Testing

- **`.terminal` export**: If on macOS, import into Terminal.app and verify colors match
- **JSON export**: Validate the JSON is parseable and contains all expected fields
- **CSS Variables copy**: Paste into a CSS file, verify it's valid CSS
- **File naming**: Verify slugification works correctly for theme names with special characters, spaces, emoji

### 8.6 URL Sharing Round-Trip

1. Create a custom theme with specific colors
2. Click "Share" → URL updates
3. Copy the URL
4. Open in a new tab/window
5. Verify the custom theme loads with identical colors
6. Verify the theme name is preserved

### 8.7 Keyboard Navigation

- Verify all keyboard shortcuts work as documented
- Verify shortcuts are disabled when typing in search input or theme name input
- Verify Escape closes modals, exits custom mode, exits comparison mode (in that priority order)
- Verify ←/→ wraps around the theme list (or stops at boundaries — decide which feels better)

### 8.8 Performance Check

- **Theme switching**: Should be instant (< 16ms) — just CSS variable updates
- **Slider dragging**: Should be smooth 60fps — check for jank during palette regeneration
- **Simulator playback**: Should be smooth at all speed settings
- **Comparison mode drag**: Should be smooth 60fps
- **Page load**: Should be fast — bundled themes are imported at build time, no blocking fetches

If palette regeneration during slider drag causes jank, consider debouncing slider input events (10–16ms) or using `requestAnimationFrame` to batch updates.

### 8.9 Build Verification

```bash
npm run build
```

Must succeed with:
- Zero TypeScript errors
- No console warnings/errors in the browser
- Production build should work with `npm run preview`

### 8.10 Final Cleanup

- Remove any `console.log` debugging statements
- Remove any TODO comments that have been addressed
- Ensure all imports are used (TypeScript strict should catch this)
- Verify no unused files exist in `src/`
- Ensure `color-theme-min.js` in repo root is preserved (it's reference material, not part of the build)

## Verification (Final Checklist)

- [ ] Visual match with mockup (within reason — it's a high-fidelity reference)
- [ ] All 16 themes selectable and visually distinct
- [ ] Terminal preview plays, pauses, loops, speed changes, scenario switches
- [ ] Custom builder generates coherent palettes from all slider combinations
- [ ] Pin/unpin and lock/unlock work correctly
- [ ] Export produces valid .terminal, JSON, and CSS output
- [ ] URL sharing round-trips correctly
- [ ] Comparison mode works with draggable slider
- [ ] Search filters themes
- [ ] Favorites persist across page reloads
- [ ] Font size/family controls work and persist
- [ ] Keyboard shortcuts all functional
- [ ] Ambient background shifts with theme
- [ ] No console errors
- [ ] `npm run build` and `npm run preview` both work
- [ ] Smooth performance (no jank on slider drag, theme switch, comparison drag)

## Files Modified

- Potentially any file — this is a polish phase
- Focus on `src/style.css` for visual fixes
- Fix any TypeScript issues across all modules
