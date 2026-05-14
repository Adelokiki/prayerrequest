import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "re_ioSdY7NT_DCHhxjeZr4Am1cJfZ9Jz5Zm2";
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "prayerteamagc@gmail.com";

    const emailBody = {
      from: "Prayer Requests <onboarding@resend.dev>",
      to: [ADMIN_EMAIL],
      subject: "New Anonymous Prayer Request",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1e293b; border-radius: 12px; border: 1px solid #334155;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; padding: 12px 24px; background: #10b981; border-radius: 8px;">
              <span style="color: white; font-weight: bold; font-size: 14px;">PRAYER REQUEST</span>
            </div>
          </div>
          <h2 style="color: #f1f5f9; font-size: 24px; margin: 16px 0; text-align: center;">A New Prayer Request</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 24px; text-align: center;">Someone has submitted an anonymous prayer request.</p>
          <blockquote style="background: #0f172a; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; color: #e2e8f0; font-size: 16px; line-height: 1.8; margin: 0;">
            ${message.replace(/\n/g, "<br/>")}
          </blockquote>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Submitted anonymously via All For God Center prayer request link.</p>
        </div>
      `,
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailBody),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: err }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
