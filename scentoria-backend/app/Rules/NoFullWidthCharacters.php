<?php
 
namespace App\Rules;
 
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
 
class NoFullWidthCharacters implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (!is_string($value)) {
            return;
        }
 
        if (preg_match('/[\x{3000}\x{FF00}-\x{FFEF}]/u', $value)) {
            $fail('The :attribute field may not contain full-width characters.');
        }
    }
}
 
 