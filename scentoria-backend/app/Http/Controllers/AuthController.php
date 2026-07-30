<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    if (! auth()->attempt($credentials)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    $user = auth()->user();
    $token = $user->createToken('auth-token')->plainTextToken;

    return response()->json(['user' => $user, 'token' => $token]);
}

public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    return response()->json(['message' => 'Logged out successfully']);
}

public function register(RegisterRequest $request)
{
    $validated = $request->validated();

    $user = User::create([
        'name' => $validated['name'],
        'email' => $validated['email'],
        'phone_number' => $validated['phone_number'] ?? null,
        'password' => Hash::make($validated['password']),
        'role' => 'customer',
    ]);

    $token = $user->createToken('auth-token')->plainTextToken;

    return response()->json(['user' => $user, 'token' => $token], 201);
}

public function checkEmail(Request $request)
{
    $request->validate(['email' => 'required|email']);
    $exists = User::where('email', $request->query('email'))->exists();
    return response()->json(['exists' => $exists]);
}
}