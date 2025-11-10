import { Request, Response } from 'express';
import prisma from '../config/database';

export class SeedController {
  async seedUsers(req: Request, res: Response) {
    try {
      const bcrypt = require('bcryptjs');
      
      // Check if admin already exists
      const existingAdmin = await prisma.user.findFirst({
        where: { email: 'admin@travelencyclopedia.com' }
      });

      if (existingAdmin) {
        return res.status(200).json({
          message: 'Users already exist',
          users: [
            { email: 'admin@travelencyclopedia.com', password: 'admin123', role: 'SITE_ADMIN' },
            { email: 'tourism@travelencyclopedia.com', password: 'tourism123', role: 'GOVT_DEPARTMENT' },
            { email: 'guide@travelencyclopedia.com', password: 'guide123', role: 'TOURIST_GUIDE' },
            { email: 'user@travelencyclopedia.com', password: 'user123', role: 'USER' }
          ]
        });
      }

      // Create default users
      const users = [
        {
          email: 'admin@travelencyclopedia.com',
          password: await bcrypt.hash('admin123', 10),
          role: 'SITE_ADMIN',
          name: 'Site Administrator'
        },
        {
          email: 'tourism@travelencyclopedia.com',
          password: await bcrypt.hash('tourism123', 10),
          role: 'GOVT_DEPARTMENT',
          name: 'Tourism Department'
        },
        {
          email: 'guide@travelencyclopedia.com',
          password: await bcrypt.hash('guide123', 10),
          role: 'TOURIST_GUIDE',
          name: 'Travel Guide'
        },
        {
          email: 'user@travelencyclopedia.com',
          password: await bcrypt.hash('user123', 10),
          role: 'USER',
          name: 'Regular User'
        }
      ];

      for (const userData of users) {
        await prisma.user.create({
          data: {
            email: userData.email,
            password: userData.password,
            role: userData.role as any,
            isActive: true,
            profile: {
              create: {
                name: userData.name
              }
            }
          }
        });
      }

      res.status(200).json({
        message: 'Successfully seeded users',
        users: [
          { email: 'admin@travelencyclopedia.com', password: 'admin123', role: 'SITE_ADMIN' },
          { email: 'tourism@travelencyclopedia.com', password: 'tourism123', role: 'GOVT_DEPARTMENT' },
          { email: 'guide@travelencyclopedia.com', password: 'guide123', role: 'TOURIST_GUIDE' },
          { email: 'user@travelencyclopedia.com', password: 'user123', role: 'USER' }
        ]
      });
    } catch (error) {
      console.error('Error seeding users:', error);
      res.status(500).json({ error: 'Failed to seed users' });
    }
  }

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

  async seedLocations(req: Request, res: Response) {
    try {
      let adminUser = await prisma.user.findFirst({ where: { role: 'SITE_ADMIN' } });
      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: 'admin@butterfliy.com',
            password: '$2b$10$abcdefghijklmnopqrstuv',
            role: 'SITE_ADMIN',
            isActive: true,
            profile: { create: { name: 'Admin User' } }
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

      await prisma.location.deleteMany({});

      const locations = [
        {
          country: 'India',
          state: 'Kerala',
          area: 'Munnar',
          description: 'Munnar is a hill station in Kerala, known for its tea estates, scenic beauty, and pleasant climate. Located in the Western Ghats, it offers breathtaking views of rolling hills covered with tea plantations.',
          images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
          latitude: 10.0889,
          longitude: 77.0595,
          howToReach: 'Munnar is well connected by road. The nearest airport is Cochin International Airport (110 km) and the nearest railway station is Aluva (108 km).',
          nearestAirport: 'Cochin International Airport',
          airportDistance: '110 km',
          nearestRailway: 'Aluva Railway Station',
          railwayDistance: '108 km',
          nearestBusStation: 'Munnar Bus Stand',
          busStationDistance: '2 km',
          attractions: ['Tea Gardens', 'Eravikulam National Park', 'Mattupetty Dam', 'Echo Point', 'Kundala Lake'],
          kidsAttractions: ['Echo Point', 'Kundala Lake', 'Rose Garden'],
          createdBy: adminUser.id,
          createdByRole: 'SITE_ADMIN',
          approvalStatus: 'APPROVED'
        },
        {
          country: 'India',
          state: 'Rajasthan',
          area: 'Jaipur',
          description: 'Jaipur, the Pink City, is the capital of Rajasthan. Known for its magnificent forts, palaces, and vibrant culture, it\'s a perfect blend of history and modernity.',
          images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'],
          latitude: 26.9124,
          longitude: 75.7873,
          howToReach: 'Jaipur is well connected by air, rail, and road. Jaipur International Airport has flights from major cities. The city has excellent rail connectivity.',
          nearestAirport: 'Jaipur International Airport',
          airportDistance: '12 km',
          nearestRailway: 'Jaipur Junction',
          railwayDistance: '5 km',
          nearestBusStation: 'Sindhi Camp Bus Stand',
          busStationDistance: '3 km',
          attractions: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Jal Mahal'],
          kidsAttractions: ['Jaipur Zoo', 'Chokhi Dhani', 'Jawahar Kala Kendra'],
          createdBy: govtUser.id,
          createdByRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED'
        },
        {
          country: 'India',
          state: 'Goa',
          area: 'North Goa',
          description: 'North Goa is famous for its beautiful beaches, vibrant nightlife, Portuguese heritage, and water sports. It\'s a perfect destination for beach lovers and party enthusiasts.',
          images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
          latitude: 15.5057,
          longitude: 73.9964,
          howToReach: 'Goa International Airport (Dabolim) is well connected to major Indian cities. Goa also has good rail and road connectivity.',
          nearestAirport: 'Goa International Airport',
          airportDistance: '40 km',
          nearestRailway: 'Thivim Railway Station',
          railwayDistance: '20 km',
          nearestBusStation: 'Mapusa Bus Stand',
          busStationDistance: '10 km',
          attractions: ['Calangute Beach', 'Baga Beach', 'Fort Aguada', 'Anjuna Flea Market', 'Chapora Fort'],
          kidsAttractions: ['Splashdown Waterpark', 'Butterfly Conservatory', 'Goa Science Centre'],
          createdBy: guideUser.id,
          createdByRole: 'TOURIST_GUIDE',
          approvalStatus: 'PENDING'
        },
        {
          country: 'India',
          state: 'Himachal Pradesh',
          area: 'Manali',
          description: 'Manali is a high-altitude Himalayan resort town known for its cool climate, snow-capped mountains, and adventure activities. It\'s a popular destination for honeymooners and adventure seekers.',
          images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
          latitude: 32.2432,
          longitude: 77.1892,
          howToReach: 'The nearest airport is Bhuntar Airport (50 km). Manali is well connected by road from Delhi, Chandigarh, and other major cities.',
          nearestAirport: 'Bhuntar Airport (Kullu)',
          airportDistance: '50 km',
          nearestRailway: 'Joginder Nagar Railway Station',
          railwayDistance: '165 km',
          nearestBusStation: 'Manali Bus Stand',
          busStationDistance: '1 km',
          attractions: ['Rohtang Pass', 'Solang Valley', 'Hadimba Temple', 'Vashisht Hot Springs', 'Old Manali'],
          kidsAttractions: ['Solang Valley', 'Van Vihar National Park', 'Manali Nature Park'],
          createdBy: adminUser.id,
          createdByRole: 'SITE_ADMIN',
          approvalStatus: 'APPROVED'
        },
        {
          country: 'India',
          state: 'Uttar Pradesh',
          area: 'Agra',
          description: 'Agra is home to the iconic Taj Mahal, one of the Seven Wonders of the World. The city is rich in Mughal heritage with magnificent monuments and historical significance.',
          images: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'],
          latitude: 27.1767,
          longitude: 78.0081,
          howToReach: 'Agra is well connected by air, rail, and road. The nearest airport is Agra Airport (Kheria). It has excellent rail connectivity from Delhi and other major cities.',
          nearestAirport: 'Agra Airport (Kheria)',
          airportDistance: '13 km',
          nearestRailway: 'Agra Cantt Railway Station',
          railwayDistance: '6 km',
          nearestBusStation: 'ISBT Agra',
          busStationDistance: '8 km',
          attractions: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Itmad-ud-Daulah', 'Mehtab Bagh'],
          kidsAttractions: ['Taj Mahal', 'Agra Fort', 'Wildlife SOS'],
          createdBy: govtUser.id,
          createdByRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED'
        },
        {
          country: 'India',
          state: 'Kerala',
          area: 'Alleppey',
          description: 'Alleppey (Alappuzha) is known as the Venice of the East, famous for its backwaters, houseboat cruises, and serene beauty. It\'s a perfect destination for a peaceful getaway.',
          images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800'],
          latitude: 9.4981,
          longitude: 76.3388,
          howToReach: 'The nearest airport is Cochin International Airport (85 km). Alleppey has a railway station with good connectivity. It\'s also well connected by road.',
          nearestAirport: 'Cochin International Airport',
          airportDistance: '85 km',
          nearestRailway: 'Alappuzha Railway Station',
          railwayDistance: '3 km',
          nearestBusStation: 'Alleppey Bus Stand',
          busStationDistance: '2 km',
          attractions: ['Backwater Houseboat Cruise', 'Alleppey Beach', 'Krishnapuram Palace', 'Marari Beach', 'Pathiramanal Island'],
          kidsAttractions: ['Alleppey Beach', 'Houseboat ride', 'Marari Beach'],
          createdBy: guideUser.id,
          createdByRole: 'TOURIST_GUIDE',
          approvalStatus: 'PENDING'
        }
      ];

      const createdLocations = await Promise.all(
        locations.map(location => prisma.location.create({ data: location as any }))
      );

      res.status(200).json({
        message: 'Successfully seeded locations',
        count: createdLocations.length,
        data: createdLocations
      });
    } catch (error) {
      console.error('Error seeding locations:', error);
      res.status(500).json({ error: 'Failed to seed locations' });
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

      await prisma.itineraryDay.deleteMany({});
      await prisma.package.deleteMany({});

      // Package 1: Kerala
      const kerala = await prisma.package.create({
        data: {
          title: 'Kerala Backwaters Experience',
          description: 'Explore the serene backwaters of Kerala with houseboat stays, traditional cuisine, and scenic beauty. Visit Alleppey, Kumarakom, and experience authentic Kerala culture.',
          duration: 5,
          customCountry: 'India',
          customState: 'Kerala',
          customArea: 'Alleppey & Kumarakom',
          price: 25000,
          images: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800', 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800'],
          hostId: guideUser.id,
          hostRole: 'TOURIST_GUIDE',
          approvalStatus: 'APPROVED'
        }
      });

      await prisma.itineraryDay.createMany({
        data: [
          { packageId: kerala.id, day: 1, title: 'Arrival in Kochi', description: 'Welcome to Kerala! Transfer to hotel and evening city tour.', activities: ['Airport pickup', 'Hotel check-in', 'Fort Kochi visit', 'Chinese fishing nets'] },
          { packageId: kerala.id, day: 2, title: 'Kochi to Alleppey', description: 'Drive to Alleppey and board traditional houseboat.', activities: ['Houseboat cruise', 'Backwater views', 'Traditional lunch', 'Village visits'] },
          { packageId: kerala.id, day: 3, title: 'Alleppey Backwaters', description: 'Full day exploring the serene backwaters.', activities: ['Houseboat stay', 'Bird watching', 'Local cuisine', 'Sunset views', 'Village visits'] },
          { packageId: kerala.id, day: 4, title: 'Kumarakom Bird Sanctuary', description: 'Visit the famous bird sanctuary and enjoy nature.', activities: ['Check out from houseboat', 'Kumarakom Bird Sanctuary visit', 'Ayurvedic spa session', 'Traditional Kerala lunch', 'Leisure time at resort'] },
          { packageId: kerala.id, day: 5, title: 'Departure from Kochi', description: 'Return to Kochi for departure.', activities: ['Breakfast at resort', 'Drive back to Kochi', 'Last minute shopping at Lulu Mall', 'Transfer to airport', 'Departure'] }
        ]
      });

      // Package 2: Rajasthan
      const rajasthan = await prisma.package.create({
        data: {
          title: 'Rajasthan Royal Heritage Tour',
          description: 'Experience the grandeur of Rajasthan with visits to Jaipur, Udaipur, and Jodhpur. Explore magnificent forts, palaces, and immerse in royal culture.',
          duration: 7,
          customCountry: 'India',
          customState: 'Rajasthan',
          customArea: 'Jaipur, Udaipur & Jodhpur',
          price: 45000,
          images: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800', 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800'],
          hostId: guideUser.id,
          hostRole: 'TOURIST_GUIDE',
          approvalStatus: 'APPROVED'
        }
      });

      await prisma.itineraryDay.createMany({
        data: [
          { packageId: rajasthan.id, day: 1, title: 'Arrival in Jaipur', description: 'Welcome to the Pink City! City palace and local markets.', activities: ['Airport pickup', 'Hotel check-in', 'City Palace visit', 'Hawa Mahal photo stop', 'Evening at Johari Bazaar'] },
          { packageId: rajasthan.id, day: 2, title: 'Jaipur Sightseeing', description: 'Explore magnificent forts and palaces of Jaipur.', activities: ['Amber Fort with elephant ride', 'Jal Mahal photo stop', 'Jantar Mantar observatory', 'Traditional Rajasthani dinner with folk dance'] },
          { packageId: rajasthan.id, day: 3, title: 'Jaipur to Jodhpur', description: 'Drive to the Blue City and explore Mehrangarh Fort.', activities: ['Scenic drive to Jodhpur (5-6 hours)', 'Lunch en route', 'Mehrangarh Fort visit', 'Jaswant Thada memorial', 'Clock Tower market walk'] },
          { packageId: rajasthan.id, day: 4, title: 'Jodhpur to Udaipur', description: 'Journey to the City of Lakes with Ranakpur stop.', activities: ['Drive to Udaipur', 'Stop at Ranakpur Jain Temples', 'Lunch at Ranakpur', 'Arrive Udaipur evening', 'Sunset at Lake Pichola'] },
          { packageId: rajasthan.id, day: 5, title: 'Udaipur City Tour', description: 'Explore the romantic city of lakes and palaces.', activities: ['City Palace complex', 'Jagdish Temple', 'Saheliyon ki Bari gardens', 'Boat ride on Lake Pichola', 'Visit Jag Mandir island'] },
          { packageId: rajasthan.id, day: 6, title: 'Udaipur Leisure Day', description: 'Optional activities and shopping in Udaipur.', activities: ['Optional: Monsoon Palace visit', 'Shopping at local markets', 'Miniature painting workshop', 'Rooftop dinner with lake view', 'Cultural show'] },
          { packageId: rajasthan.id, day: 7, title: 'Departure from Udaipur', description: 'Final morning in Udaipur and departure.', activities: ['Breakfast at hotel', 'Last minute shopping', 'Transfer to airport', 'Departure with memories'] }
        ]
      });

      // Package 3: Himalayan
      const himalayan = await prisma.package.create({
        data: {
          title: 'Himalayan Adventure Package',
          description: 'Trek through the majestic Himalayas, visit Manali and Shimla, experience snow-capped peaks, adventure sports, and mountain culture.',
          duration: 6,
          customCountry: 'India',
          customState: 'Himachal Pradesh',
          customArea: 'Manali & Shimla',
          price: 35000,
          images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED'
        }
      });

      await prisma.itineraryDay.createMany({
        data: [
          { packageId: himalayan.id, day: 1, title: 'Arrival in Manali', description: 'Welcome to the mountains! Arrive and acclimatize.', activities: ['Airport/Bus station pickup', 'Hotel check-in', 'Rest and acclimatization', 'Evening walk at Mall Road', 'Welcome dinner'] },
          { packageId: himalayan.id, day: 2, title: 'Manali Local Sightseeing', description: 'Explore the beauty of Manali and surroundings.', activities: ['Hadimba Temple visit', 'Manu Temple', 'Vashisht hot springs', 'Old Manali cafes', 'Tibetan Monastery'] },
          { packageId: himalayan.id, day: 3, title: 'Solang Valley Adventure', description: 'Day trip to Solang Valley for adventure activities.', activities: ['Drive to Solang Valley', 'Paragliding (optional)', 'Zorbing and skiing (seasonal)', 'Cable car ride', 'Return to Manali'] },
          { packageId: himalayan.id, day: 4, title: 'Manali to Shimla', description: 'Scenic drive through the mountains to Shimla.', activities: ['Checkout and drive to Shimla', 'Stop at Kullu Valley', 'Lunch at Mandi', 'Arrive Shimla evening', 'Mall Road walk'] },
          { packageId: himalayan.id, day: 5, title: 'Shimla Sightseeing', description: 'Explore the colonial charm of Shimla.', activities: ['Jakhu Temple (highest point)', 'The Ridge and Mall Road', 'Christ Church', 'Kufri excursion', 'Shopping at Lakkar Bazaar'] },
          { packageId: himalayan.id, day: 6, title: 'Departure from Shimla', description: 'Final morning in Shimla and departure.', activities: ['Breakfast at hotel', 'Last minute shopping', 'Transfer to airport/railway station', 'Departure'] }
        ]
      });

      // Package 4: Goa
      const goa = await prisma.package.create({
        data: {
          title: 'Goa Beach Paradise',
          description: 'Relax on pristine beaches, enjoy water sports, explore Portuguese heritage, and experience vibrant nightlife in Goa.',
          duration: 4,
          customCountry: 'India',
          customState: 'Goa',
          customArea: 'North & South Goa',
          price: 20000,
          images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800'],
          hostId: guideUser.id,
          hostRole: 'TOURIST_GUIDE',
          approvalStatus: 'APPROVED'
        }
      });

      await prisma.itineraryDay.createMany({
        data: [
          { packageId: goa.id, day: 1, title: 'Arrival in Goa', description: 'Welcome to the beach paradise! Relax and unwind.', activities: ['Airport pickup', 'Hotel check-in at beach resort', 'Relax at beach', 'Evening at Calangute Beach', 'Welcome dinner'] },
          { packageId: goa.id, day: 2, title: 'North Goa Exploration', description: 'Discover the vibrant beaches and forts of North Goa.', activities: ['Fort Aguada visit', 'Anjuna Beach', 'Vagator Beach', 'Chapora Fort', 'Saturday Night Market (if Saturday)', 'Beach shacks dinner'] },
          { packageId: goa.id, day: 3, title: 'South Goa & Water Sports', description: 'Experience pristine beaches and adventure activities.', activities: ['Palolem Beach visit', 'Water sports (jet ski, parasailing, banana boat)', 'Cabo de Rama Fort', 'Colva Beach', 'Sunset cruise'] },
          { packageId: goa.id, day: 4, title: 'Old Goa & Departure', description: 'Explore Portuguese heritage before departure.', activities: ['Basilica of Bom Jesus', 'Se Cathedral', 'Church of St. Francis of Assisi', 'Spice plantation tour', 'Last minute shopping', 'Transfer to airport'] }
        ]
      });

      // Package 5: Golden Triangle
      const goldenTriangle = await prisma.package.create({
        data: {
          title: 'Golden Triangle - Delhi, Agra, Jaipur',
          description: 'Discover India\'s most iconic destinations: Delhi\'s monuments, Agra\'s Taj Mahal, and Jaipur\'s pink city. Perfect introduction to India.',
          duration: 5,
          customCountry: 'India',
          customState: 'Delhi, Uttar Pradesh & Rajasthan',
          customArea: 'Delhi, Agra & Jaipur',
          price: 30000,
          images: ['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800'],
          hostId: govtUser.id,
          hostRole: 'GOVT_DEPARTMENT',
          approvalStatus: 'APPROVED'
        }
      });

      await prisma.itineraryDay.createMany({
        data: [
          { packageId: goldenTriangle.id, day: 1, title: 'Arrival in Delhi', description: 'Welcome to India\'s capital! Explore Old and New Delhi.', activities: ['Airport pickup', 'Hotel check-in', 'India Gate', 'Rashtrapati Bhavan drive-by', 'Qutub Minar', 'Evening at Connaught Place'] },
          { packageId: goldenTriangle.id, day: 2, title: 'Delhi Sightseeing & Drive to Agra', description: 'Explore Delhi monuments and travel to Agra.', activities: ['Red Fort', 'Jama Masjid', 'Chandni Chowk rickshaw ride', 'Raj Ghat', 'Drive to Agra (3-4 hours)', 'Evening at leisure'] },
          { packageId: goldenTriangle.id, day: 3, title: 'Agra - Taj Mahal & Drive to Jaipur', description: 'Visit the iconic Taj Mahal and travel to Jaipur.', activities: ['Sunrise at Taj Mahal', 'Agra Fort', 'Itmad-ud-Daulah (Baby Taj)', 'Drive to Jaipur via Fatehpur Sikri', 'Evening arrival in Jaipur'] },
          { packageId: goldenTriangle.id, day: 4, title: 'Jaipur - The Pink City', description: 'Explore the royal heritage of Jaipur.', activities: ['Amber Fort with elephant ride', 'Jal Mahal photo stop', 'City Palace', 'Jantar Mantar', 'Hawa Mahal', 'Evening at Chokhi Dhani village resort'] },
          { packageId: goldenTriangle.id, day: 5, title: 'Jaipur Shopping & Departure', description: 'Last minute shopping and departure.', activities: ['Breakfast at hotel', 'Johari Bazaar shopping', 'Bapu Bazaar for textiles', 'Lunch at local restaurant', 'Transfer to airport', 'Departure'] }
        ]
      });

      const packageCount = await prisma.package.count();

      res.status(200).json({
        message: 'Successfully seeded packages with complete itineraries and location details',
        count: packageCount
      });
    } catch (error) {
      console.error('Error seeding packages:', error);
      res.status(500).json({ error: 'Failed to seed packages' });
    }
  }
}

export default new SeedController();
