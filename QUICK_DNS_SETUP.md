# Quick DNS Setup for brandlens.app

Since **Vercel is your nameserver**, you can add DNS records directly via Vercel CLI or Dashboard.

---

## Option 1: Vercel CLI (Fastest)

### Step 1: Get Your DKIM Key from Resend

1. Go to https://resend.com/domains
2. Click on **brandlens.app**
3. You'll see 3 DNS records - copy the DKIM value (the long string)

### Step 2: Run These Commands

```bash
# Login to Vercel
vercel login

# Add SPF record (authorizes Resend to send emails)
vercel dns add brandlens.app @ TXT "v=spf1 include:_spf.resend.com ~all"

# Add DKIM record (replace YOUR_DKIM_KEY with the value from Resend)
vercel dns add brandlens.app resend._domainkey TXT "YOUR_DKIM_KEY"

# Add DMARC record (email authentication policy)
vercel dns add brandlens.app _dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@brandlens.app"
```

### Step 3: Verify

Wait 1-5 minutes, then check:

```bash
# Check if records are live
dig TXT brandlens.app
dig TXT resend._domainkey.brandlens.app
dig TXT _dmarc.brandlens.app
```

### Step 4: Verify in Resend

1. Go back to https://resend.com/domains
2. Click **Verify** next to brandlens.app
3. Should show ✅ **Verified**

---

## Option 2: Vercel Dashboard (Easier)

### Step 1: Get DNS Records from Resend

Go to https://resend.com/domains → Click **brandlens.app**

You'll see 3 records like:

| Type | Name | Value |
|------|------|-------|
| TXT | `@` | `v=spf1 include:_spf.resend.com ~all` |
| TXT | `resend._domainkey` | `p=MIGfMA0GCS...` (long string) |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

### Step 2: Add to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your **brandlens** project
3. Go to **Settings** → **Domains**
4. Click on **brandlens.app**
5. Scroll to **DNS Records**
6. Click **Add Record** for each record above

For each record:
- **Type**: TXT
- **Name**: (from table above)
- **Value**: (from Resend)
- Click **Save**

### Step 3: Verify in Resend

Wait 1-5 minutes, then:
1. Go to https://resend.com/domains
2. Click **Verify**
3. Should show ✅ **Verified**

---

## From Email Address

Once verified, update your `.env.local`:

```bash
RESEND_FROM_EMAIL="BrandLens <reports@brandlens.app>"
```

Or use any subdomain:
- `hello@brandlens.app`
- `noreply@brandlens.app`
- `support@brandlens.app`

---

## Troubleshooting

### "Domain not verified"
- **Wait longer** - DNS can take up to 48 hours (usually < 5 minutes)
- **Check exact values** - Copy-paste exactly from Resend
- **Remove duplicates** - Check for existing TXT records

### "DNS record already exists"
```bash
# List existing records
vercel dns ls brandlens.app

# Remove duplicate if needed
vercel dns rm RECORD_ID
```

### Check DNS propagation
- Online tool: https://dnschecker.org
- Command: `dig TXT brandlens.app`

---

## ✅ Quick Checklist

- [ ] Get DKIM key from Resend Dashboard
- [ ] Add 3 DNS records to Vercel (SPF, DKIM, DMARC)
- [ ] Wait 1-5 minutes for propagation
- [ ] Verify in Resend Dashboard
- [ ] Update `RESEND_FROM_EMAIL` to use `@brandlens.app`
- [ ] Test sending an email

---

**Need the DKIM key?**

From your screenshot, you should see it in Resend Dashboard at:
https://resend.com/domains → brandlens.app → DNS Records

Copy the **entire value** from the DKIM row (starts with `p=MIGf...`)

---

**Once verified, your emails will send from `reports@brandlens.app`** 🚀
