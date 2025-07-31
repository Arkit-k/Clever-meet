# 🚀 Cal.com Integration Setup Guide

## Current Status ✅
- ✅ Webhook endpoint is working: `/api/webhooks/cal`
- ✅ Database is properly configured
- ✅ Meeting creation logic is functional
- ✅ ngrok tunnel is active: `https://4b008e700e9f.ngrok-free.app`

## Step-by-Step Setup

### 1. Configure Cal.com Webhook

1. **Go to Cal.com Dashboard**: https://app.cal.com
2. **Navigate to**: Settings → Developer → Webhooks
3. **Click**: "Add Webhook"
4. **Enter these details**:
   - **Webhook URL**: `https://4b008e700e9f.ngrok-free.app/api/webhooks/cal`
   - **Events**: Select `BOOKING_CREATED` (and optionally `BOOKING_CANCELLED`)
   - **Active**: ✅ Enabled

### 2. Test the Integration

1. **Go to your Cal.com booking page** (e.g., `https://cal.com/your-username/15min`)
2. **Book a test meeting** as if you were a client
3. **Check your app**:
   - Go to: `http://localhost:3000/auth/signin`
   - Log in as: `mohitoshkarmokar8720@gmail.com` (or another freelancer)
   - Go to: `http://localhost:3000/dashboard/meetings`
   - **You should see the new meeting with PENDING status**

### 3. Verify It's Working

Run this command to check for new meetings:
```bash
node debug-system.js
```

You should see a new meeting created from Cal.com with:
- Status: PENDING
- Client: The person who booked
- Freelancer: The Cal.com account owner

## Important Notes

### ⚠️ ngrok URL Changes
The current ngrok URL `https://4b008e700e9f.ngrok-free.app` will change when you restart ngrok. 

**For production**, you need to:
1. Deploy your app to Vercel/Netlify/etc.
2. Use the permanent URL in Cal.com webhook settings

### 🔧 Troubleshooting

**If webhooks aren't working:**

1. **Check ngrok is running**: The terminal with ngrok should still be active
2. **Check webhook logs**: Look at your app console for webhook messages
3. **Test webhook manually**:
   ```bash
   node test-webhook-external.js
   ```
4. **Verify Cal.com webhook settings**: Make sure the URL is correct and events are selected

### 🎯 What Happens When Someone Books

1. **Client books** on your Cal.com page
2. **Cal.com sends webhook** to your app
3. **App creates meeting** with PENDING status
4. **Freelancer gets notification** (if configured)
5. **Freelancer can approve/decline** in dashboard
6. **Both parties can collaborate** in meeting room once approved

## Next Steps

1. **Set up Cal.com webhook** (follow steps above)
2. **Test with real booking**
3. **Deploy to production** for permanent URL
4. **Configure email notifications** (optional)

## Current Webhook URL
```
https://4b008e700e9f.ngrok-free.app/api/webhooks/cal
```

**Remember**: This URL changes when ngrok restarts!
