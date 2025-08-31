Kiosk → n8n (PWA)
=================
Last built: 2025-08-31T03:23:16.682900Z

WHAT THIS IS
------------
A lightweight, phone-friendly kiosk webapp that:
- Captures GPS (with user permission)
- Lets a user add a short description + optional photo
- Posts JSON to your n8n Webhook URL
- Generates a Google Maps link like https://maps.google.com/?q=LAT,LNG
- Can be installed to Home Screen (PWA) and works offline (queues submissions)

HOW TO DEPLOY (fastest)
-----------------------
1) Replace the webhook URL in index.html:
   const webhookUrl = "https://YOUR-N8N-URL/webhook/kiosk-intake"

2) Host the folder anywhere static (GitHub Pages, Netlify, Cloudflare Pages, S3+CloudFront, n8n's static if available).
   On Netlify/Pages, just drag-and-drop this folder.

3) Open on your phone, allow location, fill, and submit.

HOW TO USE IN n8n
-----------------
- Create a "Webhook" node:
  • HTTP Method: POST
  • Path: /webhook/kiosk-intake (or anything you like)
  • Respond: 200 OK
- Optional: Add a "Code" node to normalize fields. Example (JavaScript):

const norm = s => (s == null ? "" : String(s)).trim();
const body = $json; // webhook JSON
return [{ json: {
  who: norm(body.who),
  contact: norm(body.contact),
  summary: norm(body.summary),
  site: norm(body.site),
  device: norm(body.device),
  submitted_at: norm(body.submitted_at),
  lat: body.coords?.lat ?? null,
  lng: body.coords?.lng ?? null,
  accuracy_m: body.coords?.accuracy_m ?? null,
  maps_link: body.maps_link ?? (body.coords ? `https://maps.google.com/?q=${body.coords.lat},${body.coords.lng}` : null),
  photo_b64: body.photo_b64 ?? null
} }];

- From there, store to Google Sheet/DB, email, Slack, etc.

NOTES
-----
- Users must grant Location permission; otherwise coords will be null.
- Photo is sent as data URL (base64). For large photos, consider resizing client-side or setting a max file size.
- If offline or webhook fails, submission is queued locally and retried when online (Background Sync).
- Privacy: GPS can reveal precise location; inform users per your policy.