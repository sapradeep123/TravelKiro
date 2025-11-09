import { Request, Response } from 'express';
import prisma from '../config/database';

export class SeedController {
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
        },
        {
          title: 'Goa Sunburn Festival 2025',
          description: 'Asia\'s biggest electronic music festival featuring international DJs, beach parties, and non-stop entertainment.',
          eventType: 'Concert',
          venue: 'Vagator Beach',
          customCountry: 'India',
          customState: 'Goa',
          customArea: 'North Goa',
          startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 63 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800'],
          nearestAirport: 'Goa International Airport',
          airportDistance: '40 km',
          nearestRailway: 'Thivim Railway Station',
          railwayDistance: '25 km',
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED',
          isActive: true
        },
        {
          title: 'Jaipur Literature Festival 2025',
          description: 'World\'s largest free literary festival featuring renowned authors, poets, and thinkers from around the globe.',
          eventType: 'Cultural',
          venue: 'Diggi Palace',
          customCountry: 'India',
          customState: 'Rajasthan',
          customArea: 'Jaipur',
          startDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 95 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'],
          nearestAirport: 'Jaipur International Airport',
          airportDistance: '12 km',
          nearestRailway: 'Jaipur Junction',
          railwayDistance: '5 km',
          hostId: adminUser.id,
          hostRole: 'SITE_ADMIN',
          approvalStatus: 'APPROVED',
          isActive: true
        },
        {
          title: 'Nehru Trophy Boat Race 2025',
          description: 'Famous snake boat race in the backwaters of Kerala. Watch traditional chundan vallams compete in this spectacular event.',
          eventType: 'Sports',
          venue: 'Punnamada Lake',
          customCountry: 'India',
          customState: 'Kerala',
          customArea: 'Alappuzha',
          startDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 121 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'],
          nearestAirport: 'Cochin International Airport',
          airportDistance: '85 km',
          nearestRailway: 'Alappuzha Railway Station',
          railwayDistance: '3 km',
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED',
          isActive: true
        },
        {
          title: 'Pushkar Camel Fair 2025',
          description: 'One of the world\'s largest camel fairs featuring livestock trading, cultural events, and traditional competitions.',
          eventType: 'Festival',
          venue: 'Pushkar Fairground',
          customCountry: 'India',
          customState: 'Rajasthan',
          customArea: 'Pushkar',
          startDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 157 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800'],
          nearestAirport: 'Jaipur International Airport',
          airportDistance: '145 km',
          nearestRailway: 'Ajmer Railway Station',
          railwayDistance: '15 km',
          hostId: adminUser.id,
          hostRole: 'SITE_ADMIN',
          approvalStatus: 'APPROVED',
          isActive: true
        },
        {
          title: 'Hampi Utsav 2025',
          description: 'Cultural extravaganza celebrating the heritage of Hampi with dance, music, and traditional performances.',
          eventType: 'Cultural',
          venue: 'Hampi Ruins',
          customCountry: 'India',
          customState: 'Karnataka',
          customArea: 'Hampi',
          startDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 183 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
          nearestAirport: 'Hubli Airport',
          airportDistance: '140 km',
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED',
          isActive: false
        },
        {
          title: 'Holi Festival of Colors 2025',
          description: 'Celebrate the festival of colors with music, dance, and traditional colors. A joyous celebration of spring.',
          eventType: 'Festival',
          venue: 'Mathura Temple Complex',
          customCountry: 'India',
          customState: 'Uttar Pradesh',
          customArea: 'Mathura',
          startDate: new Date(Date.now() + 210 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 211 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800'],
          nearestAirport: 'Indira Gandhi International Airport',
          airportDistance: '150 km',
          nearestRailway: 'Mathura Junction',
          railwayDistance: '2 km',
          hostId: adminUser.id,
          hostRole: 'SITE_ADMIN',
          approvalStatus: 'APPROVED',
          isActive: true
        },
        {
          title: 'Manali Winter Carnival 2025',
          description: 'Winter sports festival featuring skiing, snowboarding, ice skating, and cultural performances in the snow.',
          eventType: 'Sports',
          venue: 'Manali Mall Road',
          customCountry: 'India',
          customState: 'Himachal Pradesh',
          customArea: 'Manali',
          startDate: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 245 * 24 * 60 * 60 * 1000),
          images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800'],
          nearestAirport: 'Bhuntar Airport',
          airportDistance: '50 km',
          nearestRailway: 'Joginder Nagar Railway Station',
          railwayDistance: '165 km',
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
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
}

export default new SeedController();
