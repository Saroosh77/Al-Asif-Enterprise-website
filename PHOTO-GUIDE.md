# Replace or Add Solar Project Photos

All public website images are in `public/images`.

## Replace the current placeholders

| Filename | Where it appears | Recommended image |
| --- | --- | --- |
| `hero-solar-equipment.jpg` | Large homepage hero image | Strong equipment or completed installation photo, at least 1600 px wide |
| `project-hybrid-inverter.jpg` | Large project card | Clean inverter/battery installation, preferably landscape |
| `project-inverter-options.jpg` | Upper small project card | Inverter or equipment close-up |
| `project-battery-solutions.jpg` | Lower small project card | Battery bank or backup installation |
| `al-asif-letterhead.jpg` | Cropped official logo in header/footer | Keep unless a separate high-resolution logo becomes available |

To replace a photo without editing code:

1. Prepare a JPG image (JPEG compresses real photos far better than PNG — a typical photo this size should end up well under 1 MB; PNG is only worth using for flat graphics/logos).
2. Rename it to the exact filename above, keeping the `.jpg` extension.
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

The gallery cards and the hero image use `background-size: cover` / `object-fit: cover`, which automatically fills the frame from any photo without distortion. If a new subject is cut off oddly, edit `background-position` (or `object-position` for the hero) in `app/globals.css`:

- `.hero-image-window img`
- `.equipment-main`
- `.equipment-inverter`
- `.equipment-battery`

For example, changing `background-position: center` to `50% 30%` moves the visible focus toward the upper centre of the photo.

## Add more project cards

Add the image to `public/images`, then add a new card in the `equipment-gallery` section of `app/page.tsx` and a matching CSS background class. Use factual captions: project type, city/area, capacity and scope only when confirmed.

After any photo change, run:

```bash
npm test
npm run deploy
```

With GitHub automation set up (see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)), commit and push the photo changes instead; the workflow publishes them automatically.
