<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    protected $fillable = [
        'user_id', 'type', 'topup_id', 'order_id',
        'direction', 'amount', 'balance_after_transaction',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
