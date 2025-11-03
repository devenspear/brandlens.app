# Resend DNS Setup for Vercel

## Overview

To send emails from your custom domain (e.g., `reports@brand lens.app`), you need to configure DNS records in Vercel to verify your domain with Resend.

---

## Prerequisites

- ✅ Resend account created at [resend.com](https://resend.com)
- ✅ Domain added to Resend Dashboard
- ✅ Vercel project deployed
- ✅ Access to Vercel CLI or Dashboard

---

## Step 1: Get DNS Records from Resend

1. Go to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click on your domain
3. You'll see DNS records that need to be added (typically 3 records):
   - **SPF Record** (TXT) - Authorizes Resend to send emails
   - **DKIM Record** (TXT) - Signs emails cryptographically
   - **DMARC Record** (TXT) - Policy for email authentication

Example DNS records from Resend:

| Type | Name | Value |
|------|------|-------|
| TXT | `@` | `v=spf1 include:_spf.resend.com ~all` |
| TXT | `resend._domainkey` | `p=MIGfMA0GCS...` (long string) |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

---

## Step 2: Add DNS Records to Vercel

### Option A: Via Vercel Dashboard (Easier)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Click on your domain
5. Scroll to **DNS Records**
6. Click **Add Record** for each DNS record from Resend
7. Fill in:
   - **Type**: TXT
   - **Name**: (from Resend - e.g., `resend._domainkey`)
   - **Value**: (paste from Resend)
8. Click **Save**

### Option B: Via Vercel CLI (Recommended)

Install Vercel CLI if you haven't:
```bash
npm install -g vercel
```

Login to Vercel:
```bash
vercel login
```

Add DNS records using the Vercel CLI:

```bash
# 1. SPF Record
vercel dns add yourdomain.com @ TXT "v=spf1 include:_spf.resend.com ~all"

# 2. DKIM Record (replace with your actual DKIM value from Resend)
vercel dns add yourdomain.com resend._domainkey TXT "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC..."

# 3. DMARC Record
vercel dns add yourdomain.com _dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com"
```

**⚠️ IMPORTANT:** Replace `yourdomain.com` with your actual domain!

---

## Step 3: Verify DNS Records

### Check DNS Propagation

DNS changes can take up to 24-48 hours to propagate, but usually happen within minutes.

Check DNS propagation:
```bash
# Check SPF
dig TXT yourdomain.com

# Check DKIM
dig TXT resend._domainkey.yourdomain.com

# Check DMARC
dig TXT _dmarc.yourdomain.com
```

Or use online tools:
- [DNSChecker.org](https://dnschecker.org)
- [MXToolbox](https://mxtoolbox.com/SuperTool.aspx)

### Verify in Resend Dashboard

1. Go back to [Resend Dashboard → Domains](https://resend.com/domains)
2. Click **Verify** next to your domain
3. If successful, you'll see ✅ **Verified**

---

## Step 4: Configure Environment Variables

Add to your `.env.local`:

```bash
RESEND_API_KEY="re_YfEDgh84_MwDhMDpfmkEyYbKJLyYZx7PD"
RESEND_FROM_EMAIL="BrandLens <reports@yourdomain.com>"
```

**In Vercel:**

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - `RESEND_API_KEY` = `re_YfEDgh84_MwDhMDpfmkEyYbKJLyYZx7PD`
   - `RESEND_FROM_EMAIL` = `BrandLens <reports@yourdomain.com>`
3. Select all environments (Production, Preview, Development)
4. Click **Save**

---

## Step 5: Test Email Sending

### Test Locally

```bash
npm run dev
```

1. Visit your app
2. Create a project
3. Click "Email Report"
4. Check if email is received

### Test via API

```bash
curl -X POST http://localhost:3000/api/reports/email \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_REPORT_TOKEN","email":"test@example.com"}'
```

---

## Troubleshooting

### DNS Records Not Verifying

**Problem:** Resend shows "Not Verified" even after adding records

**Solutions:**
1. **Wait longer** - DNS propagation can take up to 48 hours
2. **Check exact values** - Copy-paste exactly from Resend (no extra spaces)
3. **Check record names**:
   - For root domain: use `@` or leave blank
   - For subdomain: use exact name (e.g., `resend._domainkey`)
4. **Remove conflicting records** - Check for duplicate TXT records
5. **Use correct domain** - If using `www.yourdomain.com`, add records for that

### Emails Not Sending

**Problem:** API returns success but emails don't arrive

**Solutions:**
1. **Check spam folder**
2. **Verify domain** in Resend Dashboard
3. **Check API key** is correct in environment variables
4. **Check from email** matches verified domain
5. **View logs** in Resend Dashboard → Activity
6. **Check Resend quota** - Free tier: 3,000 emails/month

### "Domain not found" Error

**Problem:** Resend API returns domain not found

**Solution:**
- Ensure `RESEND_FROM_EMAIL` domain matches domain in Resend Dashboard
- Example: If domain is `brandlens.app`, use `reports@brandlens.app`

---

## DNS Record Reference

### Typical Resend DNS Records

**SPF (Sender Policy Framework)**
- **Purpose:** Authorizes Resend to send emails from your domain
- **Type:** TXT
- **Name:** `@` (root domain)
- **Value:** `v=spf1 include:_spf.resend.com ~all`

**DKIM (DomainKeys Identified Mail)**
- **Purpose:** Cryptographically signs emails to prevent spoofing
- **Type:** TXT
- **Name:** `resend._domainkey`
- **Value:** Long public key starting with `p=MIGfMA0...`

**DMARC (Domain-based Message Authentication)**
- **Purpose:** Policy for handling failed authentication
- **Type:** TXT
- **Name:** `_dmarc`
- **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`

---

## Production Checklist

- [ ] DNS records added to Vercel
- [ ] Domain verified in Resend Dashboard
- [ ] Environment variables set in Vercel
- [ ] Test email sent successfully
- [ ] Email received (not in spam)
- [ ] From email matches verified domain
- [ ] API key has appropriate permissions

---

## Quick Reference Commands

```bash
# Login to Vercel
vercel login

# List DNS records
vercel dns ls yourdomain.com

# Add TXT record
vercel dns add yourdomain.com NAME TXT "VALUE"

# Remove DNS record (if needed)
vercel dns rm RECORD_ID

# Check DNS propagation
dig TXT yourdomain.com
dig TXT resend._domainkey.yourdomain.com
dig TXT _dmarc.yourdomain.com
```

---

## Support

### Resend Support
- [Resend Documentation](https://resend.com/docs)
- [Resend Discord](https://resend.com/discord)
- Email: support@resend.com

### Vercel DNS Help
- [Vercel DNS Documentation](https://vercel.com/docs/projects/domains/working-with-dns)
- [Vercel Support](https://vercel.com/support)

---

## Next Steps

Once DNS is configured and verified:

1. ✅ **Test production emails** - Send test report emails
2. ✅ **Monitor email delivery** - Check Resend Dashboard → Activity
3. ✅ **Set up webhooks** (optional) - Track email opens/clicks
4. ✅ **Configure bounce handling** - Handle failed deliveries
5. ✅ **Review spam score** - Use [Mail Tester](https://www.mail-tester.com)

---

## Email Best Practices

1. **Use descriptive from names** - "BrandLens" instead of "noreply"
2. **Include unsubscribe link** (if sending marketing emails)
3. **Monitor bounce rate** - Keep under 5%
4. **Warm up domain** - Start with low volume, gradually increase
5. **Authenticate domain** - SPF, DKIM, and DMARC all verified
6. **Test deliverability** - Send to Gmail, Outlook, Yahoo
7. **Avoid spam triggers** - Don't use ALL CAPS, excessive exclamation marks!!!

---

**Your Resend integration is ready!** 🚀
