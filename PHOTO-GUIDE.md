# Replace or Add Solar Project Photos

All public website images are in `public/images`.

## Replace the current placeholders

| Filename | Where it appears | Recommended image |
| --- | --- | --- |
| `hero-solar-equipment.png` | Large homepage hero image | Strong equipment or completed installation photo, at least 1600 px wide |
| `project-hybrid-inverter.png` | Large project card | Clean inverter/battery installation, preferably landscape |
| `project-inverter-options.png` | Upper small project card | Inverter or equipment close-up |
| `project-battery-solutions.png` | Lower small project card | Battery bank or backup installation |
| `al-asif-letterhead.jpg` | Cropped official logo in header/footer | Keep unless a separate high-resolution logo becomes available |

To replace a photo without editing code:

1. Prepare a PNG image.
2. Rename it to the exact filename above.
3. Replace the matching file in `public/images`.
4. Rebuild/redeploy the website.

Keep a copy of the old image before replacing it.

## Image quality and privacy

- Use real Al-Asif work whenever possible.
- Ask the property owner before publishing identifiable private premises.
- Remove faces, number plates, bills, serial numbers or documents unless publication is authorised.
- Use well-lit photos; avoid screenshots forwarded many times through messaging apps.
- Aim for 1600–2400 px on the longest side.
- Compress very large images so each is ideally below 1 MB.
- Do not stretch small images; they will look blurred on desktop screens.

## Adjust a crop

The gallery uses CSS background crops. If a new subject is cut off, edit these rules in `app/globals.css`:

- `.equipment-main`
- `.equipment-inverter`
- `.equipment-battery`

Change `background-position` first. For example, `50% 30%` moves the visible focus toward the upper centre. Change `background-size` only if the crop is still too close or too wide.

## Add more project cards

Add the image to `public/images`, then add a new card in the `equipment-gallery` section of `app/page.tsx` and a matching CSS background class. Use factual captions: project type, city/area, capacity and scope only when confirmed.

After any photo change, run:

```bash
npm run build
```

On the server, deploy the change with:

```bash
docker compose --env-file .env.production up -d --build
```
