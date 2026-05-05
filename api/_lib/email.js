/**
 * Email Helper using Resend API
 */
export async function sendEmail({ to, subject, html }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY is missing. Skipping email.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Homedress_na <onboarding@resend.dev>', // Replace with your domain once verified
        to: Array.isArray(to) ? to : [to],
        subject,
        html
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send email');
    
    console.log('✅ Email sent:', data.id);
    return { success: true, id: data.id };
  } catch (err) {
    console.error('❌ Resend Error:', err);
    return { success: false, error: err.message };
  }
}
