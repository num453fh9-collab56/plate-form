# Backend setup (Supabase)

Yeh project Supabase ko backend ki tarah use karta hai:

- **Postgres** — gigs, profiles, portfolio, orders, messaging
- **Auth** — email/password + Google
- **Storage** — avatars, gig videos, portfolio media
- **Realtime** — live chat

## 1. Migration run karein (ek baar)

1. [Supabase Dashboard](https://supabase.com/dashboard) kholein → apna project (`ywgwtssdhuhaftqaxgww`) select karein.
2. Left sidebar → **SQL Editor** → **New query**.
3. `supabase/migrations/0001_init.sql` ka **poora content** paste karein.
4. **Run** dabayein. Ye tables, RLS policies, triggers aur storage buckets bana dega.

> Note: `gigs` table (jo khaali thi) ko migration dobara bana deti hai. `profiles` data safe rehta hai.

## 2. Environment variables

`.env.local` me ye honi chahiye (pehle se hain):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

Netlify par bhi yehi 3 variables add karni hongi (Site settings → Environment variables).

## 3. Auth providers

Dashboard → **Authentication → Providers**:
- **Email**: enabled rakhein.
- **Google**: enable karein aur Google Cloud ka Client ID / Secret daalein. Authorized redirect URI:
  `https://ywgwtssdhuhaftqaxgww.supabase.co/auth/v1/callback`
- Dashboard → **Authentication → URL Configuration** me apna site URL (Netlify domain) aur
  `http://localhost:3000` add karein.

## 4. Storage

Buckets migration se ban jayenge: `avatars`, `gig-media`, `portfolio`, `intro-videos`.
Upload path hamesha `busket/<userId>/<file>` format me hoga (RLS isi ko allow karta hai).

## 5. Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `.next` (Netlify ka Next.js runtime plugin automatically handle karta hai)
- Environment variables add karein (upar step 2).
