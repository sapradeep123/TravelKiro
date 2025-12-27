import prisma from '../config/database';

export class UserService {
  async updateProfile(userId: string, data: {
    name?: string;
    phone?: string;
    avatar?: string;
    bio?: string;
    isCelebrity?: boolean;
    isInfluencer?: boolean;
  }) {
    const profile = await prisma.userProfile.update({
      where: { userId },
      data,
    });

    return profile;
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: user.profile,
    };
  }

  async getAllUsers(role?: string) {
    const where = role ? { role: role as any } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        profile: true,
        createdAt: true,
      },
    });

    return users;
  }
}

export default new UserService();
