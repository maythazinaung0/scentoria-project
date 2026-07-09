<?php

namespace App\Http\Controllers;

use App\Models\Order;

class OrderCompletionController extends Controller
{
    public function show(Order $order)
    {
        if ($order->status !== 'processing') {
            return view('orders.already-handled', ['order' => $order]);
        }

        return view('orders.confirm-completion', ['order' => $order]);
    }

    public function complete(Order $order)
    {
        if ($order->status === 'processing') {
            $order->update(['status' => 'completed']);
        }

        return view('orders.completed', ['order' => $order]);
    }
}