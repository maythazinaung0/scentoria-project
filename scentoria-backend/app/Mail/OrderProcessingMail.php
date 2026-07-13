<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class OrderProcessingMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public string $signedUrl;

    public function __construct(Order $order)
    {
        $this->order = $order;

        $this->signedUrl = URL::temporarySignedRoute(
        'orders.confirm-completion',
        now()->addDays(14),
        ['order' => $order->id]
        );
    }

    public function build()
    {
        return $this->subject("Your Order #{$this->order->id} is on its way!")
            ->markdown('emails.orders.processing')
            ->with([
                'order' => $this->order,
                'signedUrl' => $this->signedUrl,
            ]);
    }
}