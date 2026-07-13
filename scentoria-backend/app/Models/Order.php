<?php
 
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\User;
use App\Models\OrderItem;
 
class Order extends Model
{
    protected $fillable = ['user_id', 'total_amount', 'address', 'status', 'payment_method'];
 
    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
 
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}