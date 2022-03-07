# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

### Internationalization
Internationalization was implemented using [ngx-translate](https://github.com/ngx-translate/core).

This is based on the browser's language. If the browser detects a language that is not implemented in the application, it will default to English.

The i18n asset files are located under `frontend/src/assets/i18n`. One file is needed per language.

The translation asset files are set in the `app.module.ts`, which should not be needed to modify.
The translation default language is set in the `app.component.ts`.

For each language added, `app.component.ts` will need to be updated.

**When a language is added:** 
- Copy the en.json file and rename is to the language you want to add. As it currently is, the culture should not be included.
- Change the values to the translated ones

**When a translation is added or modified:**
- Choose an appropriate key
- Make sure to add the key in every language file
- If text is added/modified in the Common Project, it needs to be added/modified in the other applications as well.

**Testing**

To test the i18n works as expected, simply change your browser's language to whichever language you want to test. 
