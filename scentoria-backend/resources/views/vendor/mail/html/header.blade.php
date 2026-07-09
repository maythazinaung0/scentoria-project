@props(['url'])
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block;">
@if (trim($slot) === 'Laravel')
<img src="{{ config('app.url') }}/favicon.png" width="32" height="37" alt="{{ config('app.name') }}" style="display:inline-block;">
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>