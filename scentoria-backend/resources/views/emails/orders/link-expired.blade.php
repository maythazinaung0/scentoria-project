<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Link Expired — {{ config('app.name') }}</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
        font-family: 'Inter', -apple-system, sans-serif;
        background-color: #f3f0e8;
        color: #2c3527;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        line-height: 1.6;
    }

    .card {
        background: #ffffff;
        border: 1px solid #e4ded0;
        border-radius: 16px;
        max-width: 440px;
        width: 100%;
        padding: 48px 40px;
        text-align: center;
        box-shadow: 0 4px 24px -12px rgba(44, 53, 39, 0.15);
    }

    .icon-wrap {
        width: 64px;
        height: 64px;
        margin: 0 auto 24px;
        background: #f7ece0;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-wrap svg {
        width: 28px;
        height: 28px;
        stroke: #b8763a;
    }

    .eyebrow {
        font-size: 11px;
        letter-spacing: 0.3em;
        text-transform: uppercase;
        color: #6b7d4f;
        font-weight: 600;
        margin-bottom: 10px;
    }

    h1 {
        font-family: 'Playfair Display', serif;
        font-size: 26px;
        color: #2c3527;
        margin-bottom: 12px;
        line-height: 1.3;
    }

    p.desc {
        font-size: 14px;
        color: #6b6558;
        margin-bottom: 32px;
    }

    a.btn {
        display: inline-block;
        width: 100%;
        background: #6b7d4f;
        color: #ffffff;
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        text-decoration: none;
        border-radius: 8px;
        padding: 15px 24px;
        transition: background-color 0.2s ease;
    }

    a.btn:hover { background: #566541; }

    .footnote {
        margin-top: 24px;
        font-size: 13px;
        color: #a39d8c;
    }
</style>
</head>
<body>
    <div class="card">
        <div class="icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <p class="eyebrow">Link Expired</p>
        <h1>This link is no longer valid</h1>
        <p class="desc">For your security, order confirmation links expire after 14 days. If you still need to confirm your order, please contact our support team or check your account.</p>

        <a href="{{ config('app.frontend_url', '/') }}" class="btn">Back to {{ config('app.name') }}</a>

        <p class="footnote">Need help? Reach out and we'll sort it out right away.</p>
    </div>
</body>
</html>