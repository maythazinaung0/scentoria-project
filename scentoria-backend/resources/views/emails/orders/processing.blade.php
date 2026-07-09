@component('mail::message')
# Your order is on its way, {{ $order->user->name }}!

Order **#{{ $order->id }}** is now being processed and will be delivered soon.

Once you receive your package, please confirm below so we can complete your order.

@component('mail::button', ['url' => $signedUrl])
Confirm You Received Your Order
@endcomponent

Thanks for shopping with us!
{{ config('app.name') }}
@endcomponent