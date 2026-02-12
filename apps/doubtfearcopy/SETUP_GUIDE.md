# Subscription System Setup Guide

## Overview

This guide will help you set up the subscription system to work with your existing Supabase database structure. The system will now properly create subscription records after payment for users like `aisha01malik@gmail.com`.

## Current Status

✅ **Payment Controller Updated** - Now creates subscriptions in your existing `subscriptions` table  
✅ **Frontend Services Updated** - Works with your existing table structure  
✅ **Subscription Management Component** - Ready to display subscription data  
❌ **Plan IDs Need Configuration** - You need to set the actual UUIDs from your plans table  

## Step 1: Get Your Plan UUIDs

First, you need to get the actual UUIDs from your `plans` table in Supabase:

```bash
cd backend
node get-plan-ids.js
```

This will show you all the plans in your database and their UUIDs.

## Step 2: Update Plan IDs in Payment Controller

Open `backend/src/controllers/paymentController.js` and update the `PLAN_NAME_TO_ID` mapping:

```javascript
const PLAN_NAME_TO_ID = {
  basic: 'actual-uuid-from-plans-table',      // Replace with real UUID
  pro: 'actual-uuid-from-plans-table',        // Replace with real UUID  
  enterprise: 'actual-uuid-from-plans-table'  // Replace with real UUID
};
```

## Step 3: Create Plans (If They Don't Exist)

If you don't have plans in your `plans` table, run:

```bash
cd backend
node get-plan-ids.js --create
```

This will create the basic plans:
- Basic Plan (₹1/month)
- Professional Plan (₹1/month) 
- Enterprise Plan (₹1/month)

## Step 4: Test the System

Test with the specific user mentioned:

```bash
cd backend
node test-user-subscription.js
```

This will simulate a payment for `aisha01malik@gmail.com` and create a subscription record.

## Step 5: Verify in Supabase

1. Go to your Supabase dashboard
2. Navigate to Table Editor → `subscriptions` table
3. Look for the new subscription record
4. Verify the data is correct

## Database Structure

Your existing `subscriptions` table structure:
```sql
- id (uuid, primary key)
- tenant_id (uuid) 
- plan_id (uuid) - references plans table
- status (varchar) - 'active', 'expired', 'cancelled', 'suspended'
- appointments_used (int4) - tracks usage
- billing_cycle_start (date)
- billing_cycle_end (date)
- created_at (timestamptz)
- updated_at (timestamptz)
```

## What Happens After Payment

1. **User makes payment** → Razorpay processes payment
2. **Payment callback** → Frontend sends verification request
3. **Backend verification** → Creates/updates user records
4. **Subscription creation** → Creates record in `subscriptions` table
5. **Usage tracking** → Sets `appointments_used` to 0
6. **Billing cycle** → Sets monthly billing dates

## Troubleshooting

### Issue: "Invalid subscription plan" error
**Solution**: Update the `PLAN_NAME_TO_ID` mapping with correct UUIDs

### Issue: "Plan lookup failed" error  
**Solution**: Ensure your `plans` table has the required plans

### Issue: Subscription not created
**Solution**: Check Supabase logs and ensure RLS policies allow inserts

### Issue: User not found
**Solution**: Verify the user exists in `user_profiles` table

## Testing the Complete Flow

1. **Start your backend server**
2. **Run the plan setup**: `node get-plan-ids.js --create`
3. **Update plan IDs** in payment controller
4. **Test payment flow**: `node test-user-subscription.js`
5. **Verify in Supabase** dashboard

## Expected Results

After successful payment verification, you should see:

✅ New record in `subscriptions` table  
✅ Status: "active"  
✅ Appointments used: 0  
✅ Billing cycle dates set  
✅ Proper plan_id linking to plans table  

## Integration Points

The system integrates with:
- **Existing user management** (user_profiles, user_roles)
- **Tenant system** (tenants, approved_users)
- **Business profiles** (business_profiles)
- **Appointment tracking** (appointments table)

## Next Steps

Once basic functionality works:
1. **Add usage tracking** - Update `appointments_used` when appointments are created
2. **Implement renewals** - Handle billing cycle updates
3. **Add plan upgrades** - Allow users to change plans
4. **Usage limits** - Enforce appointment limits based on plan

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Verify table permissions and RLS policies
3. Ensure all required tables exist
4. Check that plan UUIDs are correct

## Quick Verification

To quickly verify everything is working:

```bash
# 1. Get your plan IDs
node get-plan-ids.js

# 2. Update payment controller with real UUIDs

# 3. Test with specific user
node test-user-subscription.js

# 4. Check Supabase subscriptions table
```

The system should now properly add users to the subscriptions table after payment! 🎉
