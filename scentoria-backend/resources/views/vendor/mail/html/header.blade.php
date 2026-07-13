@props(['url'])
<tr>
<td class="header">
@if (trim($slot) === 'Scentoria')
<p>Scentoria</p>
@else
{!! $slot !!}
@endif
</a>
</td>
</tr>