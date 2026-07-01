# Supabase Edge Backend

The NestJS API remains in `apps/api` for local development and future hosting.
Production can use Supabase Edge Functions as the hosted backend.

## Runtime URLs

Set the web app to use the functions base URL:

```txt
NEXT_PUBLIC_API_URL=https://<project-ref>.supabase.co/functions/v1
```

The existing frontend paths continue to work:

```txt
/portfolio
/portfolio/dossier
/portfolio/site-copy
/admin/content
/admin/*
```

## Secrets

Set function secrets in Supabase, not in Vercel:

```bash
npx supabase secrets set SUPABASE_ADMIN_EMAILS="viniciusfs.contato@gmail.com"
npx supabase secrets set ALLOWED_WEB_ORIGINS="http://localhost:3000,https://your-site.vercel.app"
npx supabase secrets set SUPABASE_SECRET_KEY="<server-side-supabase-secret>"
```

If the project uses `SUPABASE_SERVICE_ROLE_KEY` instead of
`SUPABASE_SECRET_KEY`, set that name; the functions support both.

## Deploy

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npx supabase functions deploy portfolio --no-verify-jwt
npx supabase functions deploy admin --no-verify-jwt
```

## Vercel

Keep only public frontend variables in Vercel:

```txt
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Do not add database URLs, admin allowlists, service role keys, or secret keys to
Vercel.
