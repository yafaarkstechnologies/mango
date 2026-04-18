"use server";

export async function sendOrderConfirmationAction(order: any) {
  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP credentials are missing. Skipping email.");
    return;
  }

  const { customer_email, customer_name, id, total_amount, order_items } = order;

  try {
    await transporter.sendMail({
      from: `"Mango Mamaji" <${process.env.SMTP_USER}>`,
      to: customer_email,
      subject: `Order Received! - #${id.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #22c55e;">Thank you for your order, ${customer_name}!</h1>
          <p>We've received your pre-order for the 2026 Mango Harvest. Your fruit is currently maturing on the tree and will be delivered during the harvest season.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #${id}</p>
            <p><strong>Total Amount:</strong> ₹${total_amount.toFixed(2)}</p>
          </div>
          <h3>Items:</h3>
          <ul>
            ${order_items.map((item: any) => `<li>${item.product_name} x ${item.quantity}</li>`).join('')}
          </ul>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you have any questions, please reply to this email or contact us at +91 9594325361.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendShippingUpdateAction(order: any) {
  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return;

  const { customer_email, customer_name, id } = order;

  try {
    await transporter.sendMail({
      from: `"Mango Mamaji" <${process.env.SMTP_USER}>`,
      to: customer_email,
      subject: `Your Mangoes are on the way! - #${id.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #eab308;">Great news!</h1>
          <p>Hi ${customer_name}, your order <strong>#${id.slice(0, 8)}</strong> has been shipped and is heading your way.</p>
          <p>Get ready for the sweetest taste of the season!</p>
          <div style="margin-top: 30px; padding: 20px; border-top: 1px solid #eee;">
            <p>Thank you for choosing Mango Mamaji.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to send shipping update email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
