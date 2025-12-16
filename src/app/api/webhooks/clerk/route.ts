import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWebhookNotification } from "@/lib/webhooks/notifications";

export async function POST(request: NextRequest) {
  try {
    // Get the webhook secret from environment variables
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Get the headers
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 }
      );
    }

    // Get the raw body
    const payload = await request.text();

    // Create a new Svix instance with the webhook secret
    const wh = new Webhook(webhookSecret);

    let evt: {
      type: string;
      data: {
        id: string;
        first_name?: string | null;
        last_name?: string | null;
        username?: string | null;
        image_url?: string | null;
        email_addresses?: Array<{ email_address: string; id: string }>;
        [key: string]: unknown;
      };
    };

    try {
      // Verify the webhook signature
      evt = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as {
        type: string;
        data: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          username?: string | null;
          image_url?: string | null;
          email_addresses?: Array<{ email_address: string; id: string }>;
          [key: string]: unknown;
        };
      };
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await createServiceClient();

    // Log the webhook event
    const { error: logError } = await supabase
      .from("webhook_events")
      .insert({
        event_type: evt.type,
        event_data: evt.data,
        processed: false,
      });

    if (logError) {
      console.error("Failed to log webhook event:", logError);
    }

    // Handle different event types
    switch (evt.type) {
      case "user.created": {
        // Auto-add new users to admin_users table with 'viewer' role
        const primaryEmail = evt.data.email_addresses?.[0]?.email_address || null;
        
        const { error: insertError } = await supabase
          .from("admin_users")
          .insert({
            clerk_user_id: evt.data.id,
            role: "viewer",
            first_name: evt.data.first_name || null,
            last_name: evt.data.last_name || null,
            username: evt.data.username || null,
            email: primaryEmail,
            image_url: evt.data.image_url || null,
          });

        if (insertError) {
          // If user already exists, that's okay (might be a duplicate webhook)
          if (insertError.code !== "23505") {
            console.error("Failed to create admin user:", insertError);
            // Mark event as processed even if it failed (to avoid retry loops)
            await supabase
              .from("webhook_events")
              .update({ processed: true })
              .eq("event_type", evt.type)
              .eq("event_data->>id", evt.data.id)
              .order("created_at", { ascending: false })
              .limit(1);

            return NextResponse.json(
              { error: "Failed to create admin user" },
              { status: 500 }
            );
          }
        }

        // Mark event as processed
        await supabase
          .from("webhook_events")
          .update({ processed: true })
          .eq("event_type", evt.type)
          .eq("event_data->>id", evt.data.id)
          .order("created_at", { ascending: false })
          .limit(1);

        // Send notification
        await sendWebhookNotification("user.created", evt.data.id, {
          email: evt.data.email_addresses?.[0]?.email_address,
        });

        console.log(`User created: ${evt.data.id}`);
        break;
      }

      case "user.updated": {
        // Update user information when Clerk user is updated
        const primaryEmail = evt.data.email_addresses?.[0]?.email_address || null;
        
        const { error: updateError } = await supabase
          .from("admin_users")
          .update({
            first_name: evt.data.first_name || null,
            last_name: evt.data.last_name || null,
            username: evt.data.username || null,
            email: primaryEmail,
            image_url: evt.data.image_url || null,
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", evt.data.id);

        if (updateError) {
          console.error("Failed to update admin user:", updateError);
          // Mark event as processed even if it failed
          await supabase
            .from("webhook_events")
            .update({ processed: true })
            .eq("event_type", evt.type)
            .eq("event_data->>id", evt.data.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return NextResponse.json(
            { error: "Failed to update admin user" },
            { status: 500 }
          );
        }

        // Mark event as processed
        await supabase
          .from("webhook_events")
          .update({ processed: true })
          .eq("event_type", evt.type)
          .eq("event_data->>id", evt.data.id)
          .order("created_at", { ascending: false })
          .limit(1);

        console.log(`User updated: ${evt.data.id}`);
        break;
      }

      case "user.deleted": {
        // Remove user from admin_users table
        const { error: deleteError } = await supabase
          .from("admin_users")
          .delete()
          .eq("clerk_user_id", evt.data.id);

        if (deleteError) {
          console.error("Failed to delete admin user:", deleteError);
          // Mark event as processed even if it failed
          await supabase
            .from("webhook_events")
            .update({ processed: true })
            .eq("event_type", evt.type)
            .eq("event_data->>id", evt.data.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return NextResponse.json(
            { error: "Failed to delete admin user" },
            { status: 500 }
          );
        }

        // Mark event as processed
        await supabase
          .from("webhook_events")
          .update({ processed: true })
          .eq("event_type", evt.type)
          .eq("event_data->>id", evt.data.id)
          .order("created_at", { ascending: false })
          .limit(1);

        // Send notification
        await sendWebhookNotification("user.deleted", evt.data.id, {
          deleted_at: new Date().toISOString(),
        });

        console.log(`User deleted: ${evt.data.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${evt.type}`);
        // Mark as processed even if unhandled
        await supabase
          .from("webhook_events")
          .update({ processed: true })
          .eq("event_type", evt.type)
          .eq("event_data->>id", evt.data.id)
          .order("created_at", { ascending: false })
          .limit(1);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

