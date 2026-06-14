import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const body = await req.json();
        const { to, subject, text, host, port, user, pass } = body;

        if (!to || !subject || !text || !user || !pass) {
            return Response.json({ success: false, message: 'Missing required email parameters' }, { status: 400 });
        }

        const transporter = nodemailer.createTransport({
            host: host || 'smtp.gmail.com',
            port: port || 587,
            auth: {
                user: user,
                pass: pass
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        await transporter.sendMail({
            from: `"Life Care System" <${user}>`,
            to: to,
            subject: subject,
            text: text
        });

        return Response.json({ success: true, message: 'Email sent successfully via Vercel proxy' });
    } catch (error) {
        console.error('Vercel Email Proxy Error:', error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
