<?php

namespace App\Http\Controllers;

use App\Models\WalletTopup;
use App\Models\WalletTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletTopUpController extends Controller
{
    public function index()
    {
        return WalletTopup::with('user:id,name,email')
            ->orderByDesc('created_at')
            ->get();
    }

    public function update(Request $request, WalletTopup $walletTopup)
    {
        $validated = $request->validate([
            'status' => 'required|in:completed,cancelled',
        ]);*

        if ($walletTopup->status !== 'pending') {
            return response()->json(['message' => 'This request has already been reviewed.'], 422);
        }

        DB::transaction(function () use ($walletTopup, $validated) {
            $walletTopup->status = $validated['status'];
            $walletTopup->save();

            if ($validated['status'] === 'completed') {
                $user = $walletTopup->user()->lockForUpdate()->first();

                $newBalance = $user->wallet_balance + $walletTopup->deposit_amount;
                $user->wallet_balance = $newBalance;
                $user->save();

                WalletTransaction::create([
                    'user_id' => $user->id,
                    'type' => 'topup',
                    'topup_id' => $walletTopup->id,
                    'order_id' => null,
                    'direction' => 'credit',
                    'amount' => $walletTopup->deposit_amount,
                    'balance_after_transaction' => $newBalance,
                ]);
            }
        });

        return $walletTopup->fresh('user:id,name,email');
    }
}