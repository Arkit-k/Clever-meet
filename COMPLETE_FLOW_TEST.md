# 🧪 Complete Cal.com Integration Test Guide

## 📋 Testing the Full Flow: Booking → Approval → Meeting

### Step 1: Create a Test Booking

#### Option A: Use Test Endpoint (Quick Test)
```bash
# Open browser and go to:
http://localhost:3000/test-cal-booking

# Fill in:
- Freelancer Email: Arkitkarmokar@gmail.com
- Client Email: testflow@example.com  
- Client Name: Flow Test Client

# Click "Create Test Cal.com Booking"
```

#### Option B: Simulate Real Cal.com Booking
```bash
# Run this command:
node test-real-calcom-payload.js
```

### Step 2: Check Meeting Was Created

```bash
# Run this to see all meetings:
node debug-system.js

# You should see a new PENDING meeting
```

### Step 3: Test Freelancer Login & Approval

1. **Open browser**: http://localhost:3000/auth/signin

2. **Login as freelancer**:
   - Email: `Arkitkarmokar@gmail.com`
   - Password: [freelancer's password]

3. **Go to meetings dashboard**: http://localhost:3000/dashboard/meetings

4. **You should see**:
   - Pending meeting request
   - "Accept Meeting" button
   - "Decline Meeting" button

### Step 4: Test Approval Process

#### Test Accept Meeting:
1. Click **"Accept Meeting"** button
2. Meeting status should change to **CONFIRMED**
3. Client should get notification (if configured)

#### Test Reject Meeting:
1. Click **"Decline Meeting"** button  
2. Meeting status should change to **CANCELLED**

### Step 5: Test Meeting Room Access

After approval:
1. **Go to**: http://localhost:3000/meeting/[meeting-id]
2. **Both client and freelancer** can access
3. **Test features**:
   - Chat messaging
   - File upload
   - Meeting notes
   - Real-time collaboration

## 🔧 Quick Test Commands

### Create Test Meeting
```bash
# Quick test booking
curl -X POST http://localhost:3000/api/test-cal-booking \
  -H "Content-Type: application/json" \
  -d '{
    "freelancerEmail": "Arkitkarmokar@gmail.com",
    "clientEmail": "quicktest@example.com", 
    "clientName": "Quick Test"
  }'
```

### Check All Meetings
```bash
node debug-system.js
```

### Test External Webhook
```bash
node test-real-calcom-payload.js
```

## 🎯 What to Verify

### ✅ Booking Creation
- [ ] Meeting appears in database
- [ ] Status is "PENDING"
- [ ] Client account created automatically
- [ ] Freelancer matched correctly

### ✅ Freelancer Dashboard
- [ ] Can login as freelancer
- [ ] Sees pending meeting request
- [ ] Accept/Decline buttons work
- [ ] Status updates correctly

### ✅ Meeting Room
- [ ] Both parties can access after approval
- [ ] Chat works
- [ ] File upload works
- [ ] Notes can be saved

### ✅ Client Experience
- [ ] Client can login (if has password)
- [ ] Sees meeting status
- [ ] Can access meeting room when approved

## 🚨 Troubleshooting

### Meeting Not Appearing?
```bash
# Check if webhook received the booking:
# Look at your app console for logs like:
# "🔔 Cal.com webhook received: BOOKING_CREATED"
```

### Can't Login?
```bash
# Check user passwords:
node check-users.js
```

### Approval Not Working?
1. Check browser console for errors
2. Verify you're logged in as the correct freelancer
3. Check meeting ID matches

## 📱 Test Scenarios

### Scenario 1: Happy Path
1. Client books → Meeting created (PENDING)
2. Freelancer approves → Status: CONFIRMED  
3. Both access meeting room → Collaboration works

### Scenario 2: Rejection
1. Client books → Meeting created (PENDING)
2. Freelancer rejects → Status: CANCELLED
3. Client sees cancellation

### Scenario 3: Multiple Freelancers
1. Book with different freelancer emails
2. Each freelancer only sees their own meetings
3. Approval/rejection works independently

## 🔗 Quick Links

- **Test Booking**: http://localhost:3000/test-cal-booking
- **Login**: http://localhost:3000/auth/signin  
- **Meetings Dashboard**: http://localhost:3000/dashboard/meetings
- **ngrok Status**: http://localhost:4040 (to see tunnel status)

## 📊 Current System State

Run `node debug-system.js` to see:
- Total users and their roles
- All meetings and their statuses  
- Freelancer Cal.com links
- Client accounts created from bookings
