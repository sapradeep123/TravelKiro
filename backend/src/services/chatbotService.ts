import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '../config/database';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const SYSTEM_PROMPT = `You are Butterfliy, a friendly and knowledgeable travel assistant for the Butterfliy travel platform. Your role is to:

1. Help users discover travel destinations, events, packages, and accommodations available on our platform
2. Provide travel tips, advice, and recommendations
3. Answer questions about locations, best times to visit, local attractions, and travel planning
4. Be helpful, enthusiastic, and encouraging about travel experiences

IMPORTANT RULES:
- Only discuss travel-related topics (destinations, tourism, accommodations, events, travel tips, local culture, food, transportation)
- If asked about non-travel topics, politely redirect the conversation back to travel
- Be concise but informative
- Use emojis sparingly to keep responses friendly
- If you don't know specific details about a location on our platform, provide general travel advice
- Never provide medical, legal, or financial advice
- Keep responses under 300 words unless detailed information is specifically requested

When users ask about specific locations, try to mention:
- Best time to visit
- Key attractions
- Local cuisine
- Transportation options
- Accommodation suggestions`;

export class ChatbotService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }
  }

  async getContextFromDatabase(query: string): Promise<string> {
    let context = '';
    const lowerQuery = query.toLowerCase();

    try {
      // Search for relevant locations
      if (lowerQuery.includes('location') || lowerQuery.includes('place') || lowerQuery.includes('destination') || lowerQuery.includes('visit')) {
        const locations = await prisma.location.findMany({
          where: { approvalStatus: 'APPROVED' },
          take: 5,
          select: { country: true, state: true, area: true, description: true }
        });
        if (locations.length > 0) {
          context += '\n\nAvailable destinations on our platform:\n';
          locations.forEach(loc => {
            context += `- ${loc.area}, ${loc.state}, ${loc.country}: ${loc.description?.substring(0, 100)}...\n`;
          });
        }
      }

      // Search for events
      if (lowerQuery.includes('event') || lowerQuery.includes('festival') || lowerQuery.includes('happening')) {
        const events = await prisma.event.findMany({
          where: { approvalStatus: 'APPROVED', isActive: true },
          take: 5,
          select: { title: true, description: true, eventType: true, startDate: true }
        });
        if (events.length > 0) {
          context += '\n\nUpcoming events on our platform:\n';
          events.forEach(evt => {
            context += `- ${evt.title} (${evt.eventType}): ${evt.description?.substring(0, 80)}...\n`;
          });
        }
      }

      // Search for packages
      if (lowerQuery.includes('package') || lowerQuery.includes('tour') || lowerQuery.includes('trip')) {
        const packages = await prisma.package.findMany({
          where: { approvalStatus: 'APPROVED', isActive: true },
          take: 5,
          select: { title: true, description: true, duration: true, price: true }
        });
        if (packages.length > 0) {
          context += '\n\nTravel packages available:\n';
          packages.forEach(pkg => {
            context += `- ${pkg.title} (${pkg.duration} days, ₹${pkg.price}): ${pkg.description?.substring(0, 80)}...\n`;
          });
        }
      }

      // Search for accommodations
      if (lowerQuery.includes('hotel') || lowerQuery.includes('stay') || lowerQuery.includes('accommodation') || lowerQuery.includes('resort')) {
        const accommodations = await prisma.accommodation.findMany({
          where: { approvalStatus: 'APPROVED', isActive: true },
          take: 5,
          select: { name: true, type: true, area: true, state: true, description: true }
        });
        if (accommodations.length > 0) {
          context += '\n\nAccommodations on our platform:\n';
          accommodations.forEach(acc => {
            context += `- ${acc.name} (${acc.type}) in ${acc.area}, ${acc.state}\n`;
          });
        }
      }
    } catch (error) {
      console.error('Error fetching context from database:', error);
    }

    return context;
  }

  async chat(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    if (!this.model) {
      return "I'm sorry, the chatbot service is not configured. Please contact the administrator to set up the API key.";
    }

    try {
      // Get relevant context from database
      const dbContext = await this.getContextFromDatabase(message);
      
      // Build conversation context
      let fullPrompt = SYSTEM_PROMPT;
      if (dbContext) {
        fullPrompt += `\n\nHere's some relevant information from our platform:${dbContext}`;
      }
      
      // Add conversation history
      const historyText = conversationHistory
        .slice(-6) // Keep last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      
      if (historyText) {
        fullPrompt += `\n\nPrevious conversation:\n${historyText}`;
      }
      
      fullPrompt += `\n\nUser: ${message}\n\nAssistant:`;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response.text();
      
      return response || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error('Chatbot error:', error);
      
      if (error.message?.includes('API key')) {
        return "The chatbot service is not properly configured. Please contact the administrator.";
      }
      
      return "I'm having trouble processing your request right now. Please try again in a moment.";
    }
  }

  isConfigured(): boolean {
    return !!this.model;
  }
}

export default new ChatbotService();
