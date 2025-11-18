import prisma from '../config/database';

async function updateSiteSettings() {
  try {
    console.log('🔄 Updating site settings with login page fields...');

    const settings = await prisma.siteSettings.findFirst();

    if (settings) {
      await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          welcomeMessage: settings.welcomeMessage || 'Welcome Back',
          welcomeSubtitle: settings.welcomeSubtitle || 'Sign in to explore the world',
        },
      });
      console.log('✅ Site settings updated successfully!');
    } else {
      await prisma.siteSettings.create({
        data: {
          siteName: 'Butterfliy',
          siteTitle: 'Travel Encyclopedia',
          welcomeMessage: 'Welcome Back',
          welcomeSubtitle: 'Sign in to explore the world',
        },
      });
      console.log('✅ Site settings created successfully!');
    }

    const updatedSettings = await prisma.siteSettings.findFirst();
    console.log('\n📋 Current settings:');
    console.log(JSON.stringify(updatedSettings, null, 2));

  } catch (error) {
    console.error('❌ Error updating site settings:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateSiteSettings();
