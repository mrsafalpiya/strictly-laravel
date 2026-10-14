{{-- Override (see App\Support\Wayfinder\RouteTypes): parameters bound to a model take that model's route key, and `query` is typed by the action's QueryData. --}}
{!! \App\Support\Wayfinder\RouteTypes::arguments($parameters, $args) !!}{!! $options !!}?: {!! \App\Support\Wayfinder\RouteTypes::queryOptions($controller, $original_method, $isInvokable) !!}
