# @mrsafalpiya/strictly-laravel

The npm package of [Strictly Laravel](https://github.com/mrsafalpiya/strictly-laravel), which adds end-to-end type safety to a Laravel + Inertia + React app built on the official React starter kit. You write PHP, and the TypeScript types are generated from it. The app's `composer ci:check` then fails when React reads a prop, form field, route, query key, translation or broadcast payload that the server doesn't send.

This package has the route-typed React helpers, the Vite plugin, the oxlint rules, and the typed Echo and translation helpers. It needs the Composer package [`mrsafalpiya/strictly-laravel`](https://packagist.org/packages/mrsafalpiya/strictly-laravel) at the same version. While the two versions differ, the Vite plugin prints a `[strictly]` warning in `composer dev` and in every build.

## Install

Install both packages in an app generated with `laravel new my-app --react --pest --pnpm`:

```bash
composer require mrsafalpiya/strictly-laravel
composer require laravel/boost --dev
pnpm add @mrsafalpiya/strictly-laravel
php artisan strictly:install
composer ci:check
```

`strictly:install` adds this package's Vite plugin and oxlint rules to the app's config and edits its tsconfig.

## Source and issues

The source of this package is in `packages/npm` of the [strictly-laravel monorepo](https://github.com/mrsafalpiya/strictly-laravel). Open issues and pull requests there.

## License

MIT. See [LICENSE](LICENSE).
