import prisma from '../config/database';

async function initSiteSettings() {
  console.log('🌱 Initializing site settings...');

  try {
    const existing = await prisma.siteSettings.findFirst();

    if (existing) {
      console.log('✅ Site settings already exist');
      console.log('   Site Name:', existing.siteName);
      console.log('   Site Title:', existing.siteTitle);
      return;
    }

    const settings = await prisma.siteSettings.create({
      data: {
        siteName: 'Butterfliy',
        siteTitle: 'Travel Encyclopedia',
        termsAndConditions: `# Terms and Conditions

Welcome to Butterfliy Travel Encyclopedia!

## 1. Acceptance of Terms
By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily download one copy of the materials on Butterfliy's website for personal, non-commercial transitory viewing only.

## 3. Disclaimer
The materials on Butterfliy's website are provided on an 'as is' basis. Butterfliy makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.

## 4. Limitations
In no event shall Butterfliy or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Butterfliy's website.

## 5. Accuracy of Materials
The materials appearing on Butterfliy's website could include technical, typographical, or photographic errors. Butterfliy does not warrant that any of the materials on its website are accurate, complete or current.

## 6. Links
Butterfliy has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.

## 7. Modifications
Butterfliy may revise these terms of service for its website at any time without notice.

## 8. Governing Law
These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.

For questions about these Terms and Conditions, please contact us.`,
        privacyPolicy: `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## Introduction
Welcome to Butterfliy Travel Encyclopedia. We respect your privacy and are committed to protecting your personal data.

## Information We Collect
We collect information that you provide directly to us, including:
- Name and contact information
- Account credentials
- Profile information
- Travel preferences
- User-generated content (posts, comments, photos)

## How We Use Your Information
We use the information we collect to:
- Provide, maintain, and improve our services
- Process your transactions
- Send you technical notices and support messages
- Respond to your comments and questions
- Communicate with you about products, services, and events

## Information Sharing
We do not sell your personal information. We may share your information:
- With your consent
- To comply with legal obligations
- To protect our rights and prevent fraud
- With service providers who assist our operations

## Data Security
We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.

## Your Rights
You have the right to:
- Access your personal data
- Correct inaccurate data
- Request deletion of your data
- Object to processing of your data
- Request data portability

## Cookies
We use cookies and similar tracking technologies to track activity on our service and hold certain information.

## Children's Privacy
Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

## Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.

## Contact Us
If you have any questions about this Privacy Policy, please contact us.`,
      },
    });

    console.log('✅ Site settings initialized successfully!');
    console.log('   Site Name:', settings.siteName);
    console.log('   Site Title:', settings.siteTitle);
    console.log('   Terms & Conditions: Added');
    console.log('   Privacy Policy: Added');
  } catch (error) {
    console.error('❌ Error initializing site settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initSiteSettings();
