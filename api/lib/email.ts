import { logger } from './logger';
import { env } from './env';

// Email service interface - can be extended with Resend, SendGrid, etc.
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, just log the email
    logger.info({
      to: options.to,
      subject: options.subject,
      from: options.from || env.emailFrom || 'noreply@nexusai.com',
    }, 'Email would be sent');

    // Example Resend integration:
    // import { Resend } from 'resend';
    // const resend = new Resend(env.resendApiKey);
    // await resend.emails.send({
    //   from: options.from || env.emailFrom,
    //   to: options.to,
    //   subject: options.subject,
    //   html: options.html,
    //   text: options.text,
    // });
  } catch (error) {
    logger.error({ error, to: options.to }, 'Email send error');
    throw new Error('Failed to send email');
  }
}

// Email templates
export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: string,
  orderDetails: any
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Order Confirmation</h1>
      <p>Thank you for your order!</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Total:</strong> $${orderDetails.total}</p>
      <p>We'll send you updates when your order ships.</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Order Confirmation - ${orderNumber}`,
    html,
    text: `Order ${orderNumber} confirmed. Total: $${orderDetails.total}`,
  });
}

export async function sendShippingNotificationEmail(
  to: string,
  orderNumber: string,
  trackingNumber: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Your Order Has Shipped!</h1>
      <p>Good news! Your order is on its way.</p>
      <p><strong>Order Number:</strong> ${orderNumber}</p>
      <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
      <p>You can track your package using the tracking number above.</p>
    </div>
  `;

  await sendEmail({
    to,
    subject: `Order Shipped - ${orderNumber}`,
    html,
    text: `Order ${orderNumber} has shipped. Tracking: ${trackingNumber}`,
  });
}

export async function sendSellerApprovalEmail(
  to: string,
  storeName: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Seller Account Approved!</h1>
      <p>Congratulations! Your seller account has been approved.</p>
      <p><strong>Store Name:</strong> ${storeName}</p>
      <p>You can now start adding products to your store.</p>
      <a href="${env.appUrl}/seller/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Go to Seller Dashboard</a>
    </div>
  `;

  await sendEmail({
    to,
    subject: 'Seller Account Approved',
    html,
    text: `Your seller account for ${storeName} has been approved.`,
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #6366f1;">Welcome to NexusAI Commerce!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for joining NexusAI Commerce. We're excited to have you on board!</p>
      <p>Start exploring our AI-powered shopping experience today.</p>
      <a href="${env.appUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 16px;">Start Shopping</a>
    </div>
  `;

  await sendEmail({
    to,
    subject: 'Welcome to NexusAI Commerce!',
    html,
    text: `Welcome ${name} to NexusAI Commerce!`,
  });
}
