@component('mail::message')
# Your order is on its way, {{ $order->customer->name }}!

Order **#{{ $order->id }}** is now being processed and will be delivered soon.

Once you receive your package, please confirm below so we can complete your order. The link will expired after 14 days.

@component('mail::button', ['url' => $signedUrl])
Confirm You Received Your Order
@endcomponent

Thanks for shopping with us!
{{ config('app.name') }}
@endcomponent