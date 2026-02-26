import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

/**
 * Migration endpoint to update all existing users to new credit system
 * FREE: 5 credits
 * STARTER: 25 credits
 * PROFESSIONAL: 50 credits
 * ENTERPRISE: Unlimited (999999)
 */
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({
        success: false,
        error: 'Firebase Admin not configured',
      }, { status: 500 });
    }

    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    
    let updated = 0;
    let errors = 0;
    const updates: any[] = [];

    for (const doc of usersSnapshot.docs) {
      try {
        const userData = doc.data();
        const userId = doc.id;
        
        let newLimit = 5; // default free
        let newTier = userData.tier || 'free';
        
        // Determine correct limit based on tier
        if (newTier === 'free') {
          newLimit = 5;
        } else if (newTier === 'starter') {
          newLimit = 25;
        } else if (newTier === 'professional') {
          newLimit = 50;
        } else if (newTier === 'enterprise') {
          newLimit = 999999;
        } else if (newTier === 'basic') {
          // Migrate old 'basic' tier to 'free'
          newTier = 'free';
          newLimit = 5;
        } else if (newTier === 'premium') {
          // Migrate old 'premium' tier to 'professional'
          newTier = 'professional';
          newLimit = 50;
        }
        
        // Reset usage count if it exceeds new limit
        let newUsageCount = userData.usageCount || 0;
        if (newUsageCount > newLimit && newLimit !== 999999) {
          newUsageCount = 0; // Reset for fairness
        }
        
        // Update user
        await adminDb.collection('users').doc(userId).update({
          tier: newTier,
          usageLimit: newLimit,
          usageCount: newUsageCount,
          updatedAt: new Date(),
        });
        
        updates.push({
          userId,
          email: userData.email,
          oldTier: userData.tier,
          newTier,
          oldLimit: userData.usageLimit,
          newLimit,
          oldUsage: userData.usageCount,
          newUsage: newUsageCount,
        });
        
        updated++;
      } catch (error: any) {
        console.error(`Error updating user ${doc.id}:`, error);
        errors++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration complete! Updated ${updated} users, ${errors} errors`,
      totalUsers: usersSnapshot.size,
      updated,
      errors,
      updates,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
