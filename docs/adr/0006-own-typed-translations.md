# Translations use Strictly Laravel's own typed `t()`, not a third-party i18n library

Translation keys and their `:param` names are generated from the default locale's `lang/` files, other locales are checked for missing keys or params by a test, and the frontend uses a small typed `t()` from the npm package with messages compiled to JSON that Vite imports. The common Laravel/React i18n libraries do not type keys from Laravel's own files, so adopting one would still leave keys and params unchecked; owning a small `t()` is cheaper than patching one.
