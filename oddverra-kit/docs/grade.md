# Grade, palettes and DOF (agent "grade")

This summarises the agent's report. Its lab couldn't write the file, so the text was reconstructed from what it handed back.

**Lookscore:** went from 0.51 to 0.32 against 72 reference stills (lower is closer).
- Saturation 0.434 (ref 0.441)
- Shadow p5 0.153 (ref 0.154)
- Contrast 0.663 (ref 0.663)
- Hue entropy 2.63 (ref 2.78)

## Final pass, per scene and in order
1. Exposure and gamma.
2. An S-curve around a pivot.
3. Per-channel lift, gamma and gain. The lift is the toe that sets the shadow floor.
4. Hue-selective saturation: a key hue band and a sky/secondary band.
5. A skin-protect band.
6. Shadow and highlight saturation scaling.
7. Split toning, chroma only.
8. A vignette tinted toward the shadow colour.
9. Warm film halation from the bloom buffer.
10. A soft highlight shoulder into a cream ceiling (never pure white).
11. Grain.

## Looks (`GRADES`, chosen via `gradeAt().look`)
| Look | Key | Shadows / highlights |
|---|---|---|
| road | ochre key, teal-blue sky | blue-teal shadow tint |
| stadium | red key, blue sky | cream highlights, blue shadows |
| night | indigo, amber key boost | amber highlight tint |
| golden | orange key | violet shadows |
| office | amber wood | brown-purple shadows |

## DOF
- Background circle of confusion = `cInf` × `bgK` (merged value 1.2), capped by `rMax` (12 px).
- Foreground blur is capped near the old limit, so subjects stay crisp.
- Wide blurs sample a half-res pre-blurred copy, so the taps don't speckle.
- The merge uses 28 taps (speed).

## Merge tuning
After the merge, AO and soft shadows were added on top of the grade, so the final tuning was:
- each look's `lift` −0.045
- `exp` +0.10
- `con` +0.06
- golden: lift +0.02, softer vignette, key saturation 0.86
