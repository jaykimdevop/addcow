import { type NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { createServiceClient } from "@/lib/supabase/server";
import { sendWebhookNotification } from "@/lib/webhooks/notifications";

// Validate required environment variables
const REQUIRED_ENV_VARS = [
  "CLERK_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function validateEnvVars() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}

const isProduction = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    validateEnvVars();

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;

    // Get the headers
    const svixId = request.headers.get("svix-id");
    const svixTimestamp = request.headers.get("svix-timestamp");
    const svixSignature = request.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 },
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
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook verification failed:", errorMsg);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Get Supabase client
    const supabase = await createServiceClient();

    // Log the webhook event and get the ID
    const { data: webhookEvent, error: logError } = await supabase
      .from("webhook_events")
      .insert({
        event_type: evt.type,
        event_data: evt.data,
        processed: false,
      })
      .select("id")
      .single();

    if (logError) {
      const errorMsg = isProduction ? logError.message : logError;
      console.error("Failed to log webhook event:", errorMsg);
      // Continue processing even if logging fails
    }

    const webhookEventId = webhookEvent?.id;

    // Handle different event types
    switch (evt.type) {
      case "user.created": {
        // Auto-add new users to admin_users table with 'viewer' role
        const primaryEmail =
          evt.data.email_addresses?.[0]?.email_address || null;

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
            const errorMsg = isProduction ? insertError.message : insertError;
            console.error("Failed to create admin user:", errorMsg);
            // Mark event as processed even if it failed (to avoid retry loops)
            if (webhookEventId) {
              await supabase
                .from("webhook_events")
                .update({ processed: true })
                .eq("id", webhookEventId);
            }

            return NextResponse.json(
              { error: "Failed to create admin user" },
              { status: 500 },
            );
          }
        }

        // Mark event as processed
        if (webhookEventId) {
          await supabase
            .from("webhook_events")
            .update({ processed: true })
            .eq("id", webhookEventId);
        }

        // Send notification
        await sendWebhookNotification("user.created", evt.data.id, {
          email: evt.data.email_addresses?.[0]?.email_address,
        });

        console.log(`User created: ${evt.data.id}`);
        break;
      }

      case "user.updated": {
        // Update user information when Clerk user is updated
        const primaryEmail =
          evt.data.email_addresses?.[0]?.email_address || null;

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
          const errorMsg = isProduction ? updateError.message : updateError;
          console.error("Failed to update admin user:", errorMsg);
          // Mark event as processed even if it failed
          if (webhookEventId) {
            await supabase
              .from("webhook_events")
              .update({ processed: true })
              .eq("id", webhookEventId);
          }

          return NextResponse.json(
            { error: "Failed to update admin user" },
            { status: 500 },
          );
        }

        // Mark event as processed
        if (webhookEventId) {
          await supabase
            .from("webhook_events")
            .update({ processed: true })
            .eq("id", webhookEventId);
        }

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
          const errorMsg = isProduction ? deleteError.message : deleteError;
          console.error("Failed to delete admin user:", errorMsg);
          // Mark event as processed even if it failed
          if (webhookEventId) {
            await supabase
              .from("webhook_events")
              .update({ processed: true })
              .eq("id", webhookEventId);
          }

          return NextResponse.json(
            { error: "Failed to delete admin user" },
            { status: 500 },
          );
        }

        // Mark event as processed
        if (webhookEventId) {
          await supabase
            .from("webhook_events")
            .update({ processed: true })
            .eq("id", webhookEventId);
        }

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
        if (webhookEventId) {
          await supabase
            .from("webhook_events")
            .update({ processed: true })
            .eq("id", webhookEventId);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook processing error:", errorMsg);
    // Log full error in development for debugging
    if (!isProduction) {
      console.error("Full error details:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
