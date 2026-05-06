<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinanceLedger extends Model
{
    protected $fillable = ['type', 'category', 'amount', 'description', 'reference_type', 'reference_id'];
}
