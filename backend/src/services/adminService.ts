import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export class AdminService {
  async createCredentials(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
    stateAssignment?: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate role
    if (data.role !== 'GOVT_DEPARTMENT' && data.role !== 'TOURIST_GUIDE') {
      throw new Error('Can only create credentials for Govt Department or Tourist Guide');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user with profile
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        profile: {
          create: {
            name: data.name,
            phone: data.phone,
            stateAssignment: data.stateAssignment,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // In a real application, send email with credentials here
    // For now, we'll just return the credentials
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
      temporaryPassword: data.password, // In production, don't return this
    };
  }

  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'SITE_ADMIN') {
      throw new Error('Cannot delete admin users');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'User deleted successfully' };
  }

  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      profile: user.profile,
    }));
  }

  async resetUserPassword(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'SITE_ADMIN') {
      throw new Error('Cannot reset admin password');
    }

    // Generate a random password
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { newPassword };
  }

  async updateUser(userId: string, data: {
    name?: string;
    email?: string;
    role?: UserRole;
    phone?: string;
    stateAssignment?: string;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'SITE_ADMIN') {
      throw new Error('Cannot edit admin users');
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // Update user and profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email || user.email,
        role: data.role || user.role,
        profile: {
          update: {
            name: data.name || user.profile?.name || '',
            phone: data.phone,
            stateAssignment: data.stateAssignment,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    return updatedUser;
  }

  async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'SITE_ADMIN') {
      throw new Error('Cannot deactivate admin users');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
      include: { profile: true },
    });

    return updatedUser;
  }
}

export default new AdminService();
