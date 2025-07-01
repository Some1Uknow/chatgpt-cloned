import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

interface ClerkWebhookPayload {
  type: string;
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name: string;
    last_name: string;
    image_url: string;
  };
}

async function validateRequest(request: NextRequest): Promise<ClerkWebhookPayload> {
  if (!webhookSecret) {
    throw new Error(
      'CLERK_WEBHOOK_SECRET is not set. Please add it to your environment variables.'
    );
  }

  const payloadString = await request.text();
  const headerPayload = await headers();

  const svixHeaders = {
    'svix-id': headerPayload.get('svix-id')!,
    'svix-timestamp': headerPayload.get('svix-timestamp')!,
    'svix-signature': headerPayload.get('svix-signature')!,
  };

  const wh = new Webhook(webhookSecret);
  return wh.verify(payloadString, svixHeaders) as ClerkWebhookPayload;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await validateRequest(request);
    await connectToDatabase();

    switch (payload.type) {
      case 'user.created':
      case 'user.updated':
        await User.findOneAndUpdate(
          { clerkId: payload.data.id },
          {
            clerkId: payload.data.id,
            email: payload.data.email_addresses[0]?.email_address,
            firstName: payload.data.first_name,
            lastName: payload.data.last_name,
            imageUrl: payload.data.image_url,
            updatedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        break;

      case 'user.deleted':
        await User.findOneAndDelete({ clerkId: payload.data.id });
        break;

      default:
        console.log(`Unhandled webhook type: ${payload.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
