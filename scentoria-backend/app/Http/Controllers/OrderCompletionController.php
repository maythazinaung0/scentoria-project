<?php

namespace App\Http\Controllers;

use App\Models\Order;

class OrderCompletionController extends Controller
{
    public function show(Order $order)
    {
        if ($order->status !== 'processing') {
            return view('emails.orders.already-handled', ['order' => $order]);
        }

        return view('emails.orders.confirm-completion', ['order' => $order]);
    }

    public function complete(Order $order)
    {
        if ($order->status === 'processing') {
            $order->update(['status' => 'completed']);
        }

        return view('emails.orders.completed', ['order' => $order]);
    }
}