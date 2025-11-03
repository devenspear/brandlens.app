#!/bin/bash

# BrandLens DNS Setup for Resend Email
# Domain: brandlens.app (Vercel is nameserver)

echo "🚀 Setting up DNS records for Resend email service..."
echo ""

# Login to Vercel (if not already logged in)
echo "Step 1: Login to Vercel"
vercel login

echo ""
echo "Step 2: Adding DNS records..."
echo ""

# SPF Record - Authorizes Resend to send emails
echo "Adding SPF record..."
vercel dns add brandlens.app @ TXT "v=spf1 include:_spf.resend.com ~all"

# DKIM Record - Cryptographic signature for emails
# IMPORTANT: Replace the value below with your actual DKIM key from Resend Dashboard
echo "Adding DKIM record..."
echo "⚠️  You need to get your DKIM value from Resend Dashboard → Domains → brandlens.app"
echo "It will be a long string starting with 'p=MIGfMA0GCS...'"
read -p "Paste your DKIM value here: " DKIM_VALUE
vercel dns add brandlens.app resend._domainkey TXT "$DKIM_VALUE"

# DMARC Record - Email authentication policy
echo "Adding DMARC record..."
vercel dns add brandlens.app _dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@brandlens.app"

echo ""
echo "✅ DNS records added!"
echo ""
echo "Step 3: Verify DNS propagation (may take a few minutes)"
echo ""
echo "Checking SPF record..."
dig TXT brandlens.app | grep "v=spf1"

echo ""
echo "Checking DKIM record..."
dig TXT resend._domainkey.brandlens.app | grep "p=MIG"

echo ""
echo "Checking DMARC record..."
dig TXT _dmarc.brandlens.app | grep "v=DMARC1"

echo ""
echo "Step 4: Verify in Resend Dashboard"
echo "Go to: https://resend.com/domains"
echo "Click 'Verify' next to brandlens.app"
echo ""
echo "🎉 Done! Once verified, you can send emails from @brandlens.app"
