<?php

use App\Models\User;
use App\Models\SmartBin;

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = User::all();
if ($users->isEmpty()) {
    echo "No users found.\n";
    exit;
}

$bins = SmartBin::all();
foreach ($bins as $index => $bin) {
    $user = $users->get($index % $users->count());
    $bin->responsible_person = $user->name;
    $bin->save();
    echo "Updated Bin {$bin->bin_code} with PIC: {$user->name}\n";
}
