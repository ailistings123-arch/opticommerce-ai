import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

const ADMIN_EMAILS = ['ailistings123@gmail.com', 'mechannel805@gmail.com'];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth!.verifyIdToken(token);
    
    if (!ADMIN_EMAILS.includes(decodedToken.email || '')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access only' },
        { status: 403 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Get last 90 days of data
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get all optimizations
    const optimizationsSnapshot = await adminDb
      .collection('optimizations')
      .orderBy('createdAt', 'desc')
      .get();

    const urlAnalysesSnapshot = await adminDb
      .collection('urlAnalyses')
      .orderBy('createdAt', 'desc')
      .get();

    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email,
      tier: doc.data().tier,
      createdAt: doc.data().createdAt,
      usageCount: doc.data().usageCount,
      usageLimit: doc.data().usageLimit,
      displayName: doc.data().displayName,
      ...doc.data()
    }));

    // Combine all activities
    const allActivities = [
      ...optimizationsSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'optimization',
        createdAt: doc.data().createdAt,
        userId: doc.data().userId,
        platform: doc.data().platform,
        mode: doc.data().mode,
        ...doc.data()
      })),
      ...urlAnalysesSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'url-analysis',
        createdAt: doc.data().createdAt,
        userId: doc.data().userId,
        platform: doc.data().platform,
        mode: doc.data().mode,
        ...doc.data()
      }))
    ];

    // Calculate daily stats for last 90 days
    const dailyStats = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayActivities = allActivities.filter(a => {
        if (!a.createdAt) return false;
        // Handle both Timestamp objects and ISO strings
        const activityDate = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const activityDateStr = activityDate.toISOString().split('T')[0];
        return activityDateStr === dateStr;
      });

      const newUsers = users.filter(u => {
        if (!u.createdAt) return false;
        // Handle both Timestamp objects and ISO strings
        const userDate = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
        const userDateStr = userDate.toISOString().split('T')[0];
        return userDateStr === dateStr;
      });

      dailyStats.push({
        date: dateStr,
        optimizations: dayActivities.length,
        newUsers: newUsers.length,
        platforms: [...new Set(dayActivities.map(a => a.platform))].length
      });
    }

    // Per-user statistics
    const userStats = users.map(user => {
      const userActivities = allActivities.filter(a => a.userId === user.id);
      const platforms = [...new Set(userActivities.map(a => a.platform))];
      
      return {
        userId: user.id,
        email: user.email,
        tier: user.tier,
        totalOptimizations: userActivities.length,
        platformsUsed: platforms,
        lastActive: userActivities[0]?.createdAt || user.createdAt,
        joinDate: user.createdAt,
        usageCount: user.usageCount || 0,
        usageLimit: user.usageLimit || 0
      };
    }).sort((a, b) => b.totalOptimizations - a.totalOptimizations);

    // Platform breakdown
    const platformStats = allActivities.reduce((acc: any, activity) => {
      const platform = activity.platform || 'unknown';
      if (!acc[platform]) {
        acc[platform] = {
          name: platform,
          count: 0,
          users: new Set()
        };
      }
      acc[platform].count++;
      acc[platform].users.add(activity.userId);
      return acc;
    }, {});

    const platformData = Object.values(platformStats).map((p: any) => ({
      name: p.name,
      optimizations: p.count,
      uniqueUsers: p.users.size
    }));

    // Mode distribution
    const modeStats = allActivities.reduce((acc: any, activity) => {
      const mode = activity.mode || 'unknown';
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});

    // Hourly pattern
    const hourlyPattern = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      activity: allActivities.filter(a => {
        if (!a.createdAt) return false;
        const activityDate = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        return activityDate.getHours() === hour;
      }).length
    }));

    // Tier performance
    const tierPerformance = ['free', 'starter', 'professional', 'enterprise'].map(tier => {
      const tierUsers = users.filter(u => u.tier === tier);
      const tierActivities = allActivities.filter(a => {
        const user = users.find(u => u.id === a.userId);
        return user?.tier === tier;
      });

      return {
        tier,
        users: tierUsers.length,
        optimizations: tierActivities.length,
        avgPerUser: tierUsers.length > 0 ? (tierActivities.length / tierUsers.length).toFixed(2) : 0
      };
    });

    // Growth metrics
    const last30Days = allActivities.filter(a => {
      if (!a.createdAt) return false;
      const activityDate = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return activityDate >= thirtyDaysAgo;
    });

    const previous30Days = allActivities.filter(a => {
      if (!a.createdAt) return false;
      const activityDate = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return activityDate >= sixtyDaysAgo && activityDate < thirtyDaysAgo;
    });

    const growthRate = previous30Days.length > 0 
      ? (((last30Days.length - previous30Days.length) / previous30Days.length) * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        dailyStats,
        userStats,
        platformData,
        modeStats,
        hourlyPattern,
        tierPerformance,
        summary: {
          totalUsers: users.length,
          totalOptimizations: allActivities.length,
          activeUsers: userStats.filter(u => u.totalOptimizations > 0).length,
          avgOptimizationsPerUser: users.length > 0 ? (allActivities.length / users.length).toFixed(2) : 0,
          growthRate,
          last30DaysActivity: last30Days.length,
          topPlatform: platformData.sort((a: any, b: any) => b.optimizations - a.optimizations)[0]?.name || 'N/A'
        }
      }
    });

  } catch (error: any) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
