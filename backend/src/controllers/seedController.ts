import { Request, Response } from 'express';
import prisma from '../config/database';

export class SeedController {
  async seedEventTypes(req: Request, res: Response) {
    try {
      // Delete existing event types
      await prisma.eventType.deleteMany({});

      // Create default event types
      const eventTypes = [
        { name: 'Festival', description: 'Cultural and traditional festivals' },
        { name: 'Concert', description: 'Music concerts and performances' },
        { name: 'Sports', description: 'Sports events and competitions' },
        { name: 'Cultural', description: 'Cultural events and exhibitions' },
        { name: 'Religious', description: 'Religious ceremonies and gatherings' },
        { name: 'Exhibition', description: 'Trade shows and exhibitions' },
        { name: 'Conference', description: 'Professional conferences and seminars' },
        { name: 'Workshop', description: 'Educational workshops and training' },
        { name: 'Food & Drink', description: 'Food festivals and culinary events' },
        { name: 'Official', description: 'Official government events' },
        { name: 'Educational', description: 'Educational programs and seminars' },
        { name: 'Other', description: 'Other types of events' }
      ];

      const createdTypes = await Promise.all(
        eventTypes.map(type => prisma.eventType.create({ data: type }))
      );

      res.status(200).json({
        message: 'Successfully seeded event types',
        count: createdTypes.length,
        data: createdTypes
      });
    } catch (error) {
      console.error('Error seeding event types:', error);
      res.status(500).json({ error: 'Failed to seed event types' });
    }
  }

  async seedEvents(req: Request, res: Response) {
    try {
      // Get or create users
      let adminUser = await prisma.user.findFirst({
        where: { role: 'SITE_ADMIN' }
      });

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: 'admin@butterfliy.com',
            password: '$2b$10$abcdefghijklmnopqrstuv',
            role: 'SITE_ADMIN',
            isActive: true,
            profile: {
              create: {
                name: 'Admin User'
              }
            }
          }
        });
      }

      let govtUser = await prisma.user.findFirst({
        where: { role: 'GOVT_DEPARTMENT' }
      });

      if (!govtUser) {
        govtUser = await prisma.user.create({
          data: {
            email: 'tourism@butterfliy.com',
            password: '$2b$10$abcdefghijklmnopqrstuv',
            role: 'GOVT_DEPARTMENT',
            isActive: true,
            profile: {
              create: {
                name: 'Tourism Department'
              }
            }
          }
        });
      }

      // Delete existing events
      await prisma.event.deleteMany({});

      // Create sample events
      const events = [
        {
          title: 'Diwali Festival 2025',
          description: 'Grand Diwali celebration with traditional rituals, fireworks, cultural performances, and food stalls. Experience the festival of lights in its full glory.',
          eventType: 'Festival',
          venue: 'City Central Park',
          customCountry: 'India',
          customState: 'Maharashtra',
          customArea: 'Mumbai',
          startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800'],
          nearestAirport: 'Chhatrapati Shivaji International Airport',
          airportDistance: '15 km',
          nearestRailway: 'Mumbai Central Railway Station',
          railwayDistance: '8 km',
          nearestBusStation: 'Mumbai Central Bus Depot',
          busStationDistance: '5 km',
          hostId: adminUser.id,
          hostRole: 'SITE_ADMIN',
          approvalStatus: 'APPROVED',
          isActive: true
        }
      ];

      const createdEvents = await Promise.all(
        events.map(event => prisma.event.create({ data: event as any }))
      );

      res.status(200).json({
        message: 'Successfully seeded events',
        count: createdEvents.length,
        data: createdEvents
      });
    } catch (error) {
      console.error('Error seeding events:', error);
      res.status(500).json({ error: 'Failed to seed events' });
    }
  }

  async seedPackages(req: Request, res: Response) {
    try {
      let guideUser = await prisma.user.findFirst({ where: { role: 'TOURIST_GUIDE' } });
      if (!guideUser) {
        guideUser = await prisma.user.create({
          data: {
            email: 'guide@butterfliy.com',
            password: '$2b$10$abcdefghijklmnopqrstuv',
            role: 'TOURIST_GUIDE',
            isActive: true,
            profile: { create: { name: 'Travel Guide' } }
          }
        });
      }

      let govtUser = await prisma.user.findFirst({ where: { role: 'GOVT_DEPARTMENT' } });
      if (!govtUser) {
        govtUser = await prisma.user.create({
          data: {
            email: 'tourism@butterfliy.com',
            password: '$2b$10$abcdefghijklmnopqrstuv',
            role: 'GOVT_DEPARTMENT',
            isActive: true,
            profile: { create: { name: 'Tourism Department' } }
          }
        });
      }

      await prisma.package.deleteMany({});

      const packages = [
        {
          title: 'Kerala Backwaters Experience',
          description: 'Explore the serene backwaters of Kerala with houseboat stays, traditional cuisine, and scenic beauty.',
          duration: 5,
          price: 25000,
          images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'],
          hostId: guideUser.id,
          hostRole: 'TOURIST_GUIDE',
          approvalStatus: 'APPROVED'
        },
        {
          title: 'Rajasthan Royal Heritage Tour',
          description: 'Experience the grandeur of Rajasthan with visits to Jaipur, Udaipur, and Jodhpur.',
          duration: 7,
          price: 45000,
          images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'],
          hostId: guideUser.id,
          hostRole: 'TOURIST_GUIDE',
          approvalStatus: 'APPROVED'
        },
        {
          title: 'Himalayan Adventure Package',
          description: 'Trek through the majestic Himalayas, visit Manali and Shimla.',
          duration: 6,
          price: 35000,
          images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'],
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED'
        },
        {
          title: 'Goa Beach Paradise',
          description: 'Relax on pristine beaches, enjoy water sports, and explore Portuguese heritage.',
          duration: 4,
          price: 20000,
          images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'],
          hostId: guideUser.id,
          hostRole: 'TOURIST_GUIDE',
          approvalStatus: 'APPROVED'
        },
        {
          title: 'Golden Triangle - Delhi, Agra, Jaipur',
          description: 'Discover India\'s most iconic destinations: Delhi, Agra, and Jaipur.',
          duration: 5,
          price: 30000,
          images: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'],
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED'
        }
      ];

      const createdPackages = await Promise.all(
        packages.map(pkg => prisma.package.create({ data: pkg as any }))
      );

      res.status(200).json({
        message: 'Successfully seeded packages',
        count: createdPackages.length,
        data: createdPackages
      });
    } catch (error) {
      console.error('Error seeding packages:', error);
      res.status(500).json({ error: 'Failed to seed packages' });
    }
  }
}

export default new SeedController();
