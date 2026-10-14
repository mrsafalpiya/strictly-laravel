# Overlay as packages applied to the latest Base Kit, not a forked starter kit

Every project starts from a freshly generated official React starter kit at its latest version, and Strictly Laravel is applied afterwards as Composer + npm packages (`mrsafalpiya/strictly-laravel`) with an artisan installer. The packages own the behaviour and the installer writes as few files into the app as possible, so template improvements reach existing projects through `composer update` / `npm update`.

## Considered Options

- **Forked starter kit (`laravel new --using=...`)**: rejected; it pins projects to our fork of the kit and forces manual merges of upstream changes.
- **Post-generation patch/codemod**: rejected; brittle against any upstream file change and gives existing projects no update path.
