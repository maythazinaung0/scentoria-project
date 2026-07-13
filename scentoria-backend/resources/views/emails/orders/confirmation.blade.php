@component('mail::message')
# Thank you for your order, {{$order->customer->name }}!

Your order **#{{ $order->id }}** has been placed successfully.

@component('mail::table')
| Item | Qty | Price |
|:-----|:---:|------:|
@foreach ($items as $item)
| {{ $item->variant->product->name ?? 'Item' }} | {{ $item->quantity }} | {{ number_format($item->price) }} MMK |
@endforeach
@endcomponent

**Total: {{ number_format($order->total_amount) }} MMK**

**Delivery Address:** {{ $address }}
**Payment Method:** {{ ucfirst(str_replace('_', ' ', $order->payment_method)) }}

@component('mail::button', ['url' => config('app.frontend_url') . '/orders/' . $order->id])
View Your Order
@endcomponent

Thanks for shopping with us! 
{{ config('app.name') }}
@endcomponent