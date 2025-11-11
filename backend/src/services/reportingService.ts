import prisma from '../config/database';
import { CallRequestStatus } from '@prisma/client';

export class ReportingService {
  // Lead metrics
  async getLeadMetrics(filters?: {
    from?: Date;
    to?: Date;
    accommodationId?: string;
  }) {
    const where: any = {};

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    if (filters?.accommodationId) {
      where.accommodationId = filters.accommodationId;
    }

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      lostLeads,
      invalidLeads,
    ] = await Promise.all([
      prisma.accommodationCallRequest.count({ where }),
      prisma.accommodationCallRequest.count({ where: { ...where, status: 'NEW' } }),
      prisma.accommodationCallRequest.count({ where: { ...where, status: 'CONTACTED' } }),
      prisma.accommodationCallRequest.count({ where: { ...where, status: 'QUALIFIED' } }),
      prisma.accommodationCallRequest.count({ where: { ...where, status: 'CONVERTED' } }),
      prisma.accommodationCallRequest.count({ where: { ...where, status: 'LOST' } }),
      prisma.accommodationCallRequest.count({ where: { ...where, status: 'INVALID' } }),
    ]);

    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
    const qualificationRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;

    return {
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      convertedLeads,
      lostLeads,
      invalidLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      qualificationRate: parseFloat(qualificationRate.toFixed(2)),
    };
  }

  // Conversion funnel
  async getConversionFunnel(filters?: {
    from?: Date;
    to?: Date;
  }) {
    const where: any = {};

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const funnel = [
      { stage: 'New', status: 'NEW' },
      { stage: 'Contacted', status: 'CONTACTED' },
      { stage: 'Qualified', status: 'QUALIFIED' },
      { stage: 'Follow-up', status: 'FOLLOW_UP' },
      { stage: 'Scheduled', status: 'SCHEDULED' },
      { stage: 'Converted', status: 'CONVERTED' },
    ];

    const results = await Promise.all(
      funnel.map(async (item) => {
        const count = await prisma.accommodationCallRequest.count({
          where: { ...where, status: item.status as CallRequestStatus },
        });
        return {
          stage: item.stage,
          count,
        };
      })
    );

    return results;
  }

  // Admin performance
  async getAdminPerformance(filters?: {
    from?: Date;
    to?: Date;
    adminId?: string;
  }) {
    const where: any = {};

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    if (filters?.adminId) {
      where.assignedTo = filters.adminId;
    }

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['SITE_ADMIN', 'GOVT_DEPARTMENT'] },
        isActive: true,
      },
      include: {
        profile: true,
        assignedCallRequests: {
          where,
          include: {
            interactions: true,
          },
        },
      },
    });

    const performance = admins.map((admin) => {
      const requests = admin.assignedCallRequests;
      const totalRequests = requests.length;
      const convertedRequests = requests.filter((r) => r.status === 'CONVERTED').length;
      const lostRequests = requests.filter((r) => r.status === 'LOST').length;
      const activeRequests = requests.filter((r) =>
        ['NEW', 'CONTACTED', 'QUALIFIED', 'FOLLOW_UP', 'SCHEDULED'].includes(r.status)
      ).length;

      const totalInteractions = requests.reduce((sum, r) => sum + r.interactions.length, 0);
      const avgResponseTime = this.calculateAvgResponseTime(requests);

      return {
        adminId: admin.id,
        adminName: admin.profile?.name || admin.email,
        totalRequests,
        activeRequests,
        convertedRequests,
        lostRequests,
        conversionRate: totalRequests > 0 ? parseFloat(((convertedRequests / totalRequests) * 100).toFixed(2)) : 0,
        totalInteractions,
        avgInteractionsPerLead: totalRequests > 0 ? parseFloat((totalInteractions / totalRequests).toFixed(2)) : 0,
        avgResponseTime: avgResponseTime ? `${avgResponseTime} hours` : 'N/A',
      };
    });

    return performance;
  }

  private calculateAvgResponseTime(requests: any[]): number | null {
    const responseTimes = requests
      .filter((r) => r.lastContactedAt && r.createdAt)
      .map((r) => {
        const diff = new Date(r.lastContactedAt).getTime() - new Date(r.createdAt).getTime();
        return diff / (1000 * 60 * 60); // Convert to hours
      });

    if (responseTimes.length === 0) return null;

    const avg = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    return parseFloat(avg.toFixed(2));
  }

  // Property performance
  async getPropertyPerformance(filters?: {
    from?: Date;
    to?: Date;
  }) {
    const where: any = {};

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const accommodations = await prisma.accommodation.findMany({
      where: { isActive: true },
      include: {
        callRequests: {
          where,
        },
      },
      orderBy: {
        callRequests: {
          _count: 'desc',
        },
      },
      take: 20,
    });

    const performance = accommodations.map((acc) => {
      const requests = acc.callRequests;
      const totalRequests = requests.length;
      const convertedRequests = requests.filter((r) => r.status === 'CONVERTED').length;
      const conversionValue = requests
        .filter((r) => r.conversionValue)
        .reduce((sum, r) => sum + (r.conversionValue || 0), 0);

      return {
        accommodationId: acc.id,
        accommodationName: acc.name,
        type: acc.type,
        area: acc.area,
        state: acc.state,
        totalRequests,
        convertedRequests,
        conversionRate: totalRequests > 0 ? parseFloat(((convertedRequests / totalRequests) * 100).toFixed(2)) : 0,
        conversionValue,
      };
    });

    return performance;
  }

  // Time-based reports
  async getTimeBasedReport(filters?: {
    from?: Date;
    to?: Date;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const groupBy = filters?.groupBy || 'day';
    const where: any = {};

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const requests = await prisma.accommodationCallRequest.findMany({
      where,
      select: {
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by time period
    const grouped = new Map<string, { total: number; converted: number }>();

    requests.forEach((request) => {
      const date = new Date(request.createdAt);
      let key: string;

      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped.has(key)) {
        grouped.set(key, { total: 0, converted: 0 });
      }

      const data = grouped.get(key)!;
      data.total++;
      if (request.status === 'CONVERTED') {
        data.converted++;
      }
    });

    const result = Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      totalLeads: data.total,
      convertedLeads: data.converted,
      conversionRate: data.total > 0 ? parseFloat(((data.converted / data.total) * 100).toFixed(2)) : 0,
    }));

    return result;
  }

  // Lost lead reasons
  async getLostLeadReasons(filters?: {
    from?: Date;
    to?: Date;
  }) {
    const where: any = {
      status: 'LOST',
    };

    if (filters?.from || filters?.to) {
      where.createdAt = {};
      if (filters.from) where.createdAt.gte = filters.from;
      if (filters.to) where.createdAt.lte = filters.to;
    }

    const lostLeads = await prisma.accommodationCallRequest.findMany({
      where,
      include: {
        statusHistory: {
          where: {
            toStatus: 'LOST',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    const reasons = new Map<string, number>();

    lostLeads.forEach((lead) => {
      const reason = lead.statusHistory[0]?.reason || 'Not specified';
      reasons.set(reason, (reasons.get(reason) || 0) + 1);
    });

    const result = Array.from(reasons.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    return result;
  }
}

export default new ReportingService();
