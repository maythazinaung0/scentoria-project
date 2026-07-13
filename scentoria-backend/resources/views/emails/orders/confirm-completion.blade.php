<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Confirm Your Order — {{ config('app.name') }}</title>
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
        background: #eef1e6;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .icon-wrap svg {
        width: 28px;
        height: 28px;
        stroke: #6b7d4f;
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

    .order-meta {
        background: #f8f6f0;
        border: 1px solid #e4ded0;
        border-radius: 10px;
        padding: 16px 20px;
        margin-bottom: 32px;
        text-align: left;
    }

    .order-meta .row {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        padding: 4px 0;
    }

    .order-meta .label {
        color: #8a8272;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-size: 10px;
        font-weight: 600;
    }

    .order-meta .value {
        color: #2c3527;
        font-weight: 500;
    }

    form { margin: 0; }

    button {
        width: 100%;
        background: #6b7d4f;
        color: #ffffff;
        font-weight: 600;
        font-size: 13px;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        border: none;
        border-radius: 8px;
        padding: 15px 24px;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    button:hover {
        background: #566541;
    }

    .footnote {
        margin-top: 20px;
        font-size: 12px;
        color: #a39d8c;
    }
</style>
</head>
<body>
    <div class="card">
        <div class="icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L9 18l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>

        <p class="eyebrow">Order #{{ $order->id }}</p>
        <h1>Did your order arrive?</h1>
        <p class="desc">Please confirm below once you've received your package so we can complete your order.</p>

        <div class="order-meta">
            <div class="row">
                <span class="label">Total</span>
                <span class="value">{{ number_format($order->total_amount) }} MMK</span>
            </div>
            @if($order->address)
            <div class="row">
                <span class="label">Delivered To</span>
                <span class="value">{{ $order->address }}</span>
            </div>
            @endif
            <div class="row">
                <span class="label">Payment</span>
                <span class="value" style="text-transform: capitalize;">{{ str_replace('_', ' ', $order->payment_method) }}</span>
            </div>
        </div>

        <form method="POST" action="{{ route('orders.complete', $order) }}">
            @csrf
            <button type="submit">Yes, I Received It</button>
        </form>

        <p class="footnote">If you haven't received your order yet, no action is needed — this link stays valid for 14 days.</p>
    </div>
</body>
</html>