import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationAction } from '@/app/actions/email';
import crypto from 'crypto';

// Use service role key to bypass RLS for secure server-side order creation
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  // Verify signature
  const isDev = process.env.NODE_ENV === 'development';
  if (!webhookSecret) {
    if (isDev) {
      console.warn("⚠️ RAZORPAY_WEBHOOK_SECRET is missing. Bypassing signature check for local development.");
    } else {
      return NextResponse.json({ error: 'Missing webhook secret' }, { status: 400 });
    }
  } else if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  } else {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
  }

  const event = JSON.parse(body);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const notes = payment.notes;
    
    // 1. IDEMPOTENCY CHECK: Check if order already exists (via payment_id)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('payment_id', payment.id)
      .single();

    if (existingOrder) {
      console.log('Webhook: Order already exists for payment_id:', payment.id);
      return NextResponse.json({ status: 'Order already exists' });
    }

    // 2. CREATE THE ORDER
    const orderData = {
      customer_name: notes.name,
      customer_email: notes.email,
      customer_phone: notes.phone,
      flat_no: notes.flat_no,
      address_line_1: notes.address_line_1,
      address_line_2: notes.address_line_2,
      city: notes.city,
      zip: notes.zip,
      total_amount: payment.amount / 100,
      payment_id: payment.id,
      status: 'paid',
      batch_id: notes.batch_id || null
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Webhook Error: Order insertion failed', orderError);
      return NextResponse.json({ error: 'Order insertion failed' }, { status: 500 });
    }

    // 3. CREATE ORDER ITEMS & DECREMENT INVENTORY
    let finalOrderItems: any[] = [];
    if (notes.items) {
      try {
        const items = JSON.parse(notes.items);
        const orderItems = items.map((item: any) => ({
          order_id: order.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price
        }));

        // Insert items
        const { data: insertedItems } = await supabase.from('order_items').insert(orderItems).select();
        finalOrderItems = insertedItems || [];

        // Decrement Inventory
        for (const item of items) {
          if (item.id) {
            // Attempt to decrement stock if track_inventory is true
            const { data: product } = await supabase
              .from('products')
              .select('stock_quantity, track_inventory')
              .eq('id', item.id)
              .single();

            if (product && product.track_inventory) {
              const newStock = Math.max(0, product.stock_quantity - item.quantity);
              await supabase
                .from('products')
                .update({ stock_quantity: newStock })
                .eq('id', item.id);
              
              console.log(`Inventory updated for ${item.name}: ${product.stock_quantity} -> ${newStock}`);
            }
          }
        }
      } catch (e) {
        console.error('Webhook Error: Items processing failed', e);
      }
    }

    // 4. SEND CONFIRMATION EMAIL
    await sendOrderConfirmationAction({ ...order, order_items: finalOrderItems });

    console.log('✅ Webhook: Order finalized for payment:', payment.id);
    return NextResponse.json({ status: 'Order reflected successfully' });
  }

  return NextResponse.json({ status: 'Event ignored' });
}
