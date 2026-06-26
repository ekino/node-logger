## [3.0.0](https://github.com/ekino/node-logger/compare/v2.1.1..v3.0.0) - 2026-06-26

### Features

- *(3.0)* Remove fast-json-stringify - ([92d8ad5](https://github.com/ekino/node-logger/commit/92d8ad5d475f633fecde39f4eec8ade0dd393e16))
- *(3.0)* Use native crypto.randomUUID to replace uuidV4 - ([28261c4](https://github.com/ekino/node-logger/commit/28261c4986fe34e9c965cfe83f31e8f4611711e3))
- *(3.0)* Support more colors - ([efb6522](https://github.com/ekino/node-logger/commit/efb65222b7e65cadf4fe31ecc1826df741e5e159))
- *(3.0)* Remove ts-node, use tsx, convert examples to typescript - ([dfe49fb](https://github.com/ekino/node-logger/commit/dfe49fbe18f95388c0b18c5c96e139ed24fc57ae))
- *(3.0)* Convert src code to ESM - ([eb0efdc](https://github.com/ekino/node-logger/commit/eb0efdc152c6d7e2c07db1f8ce485c9c5bd38b93))
- *(perf)* Implement memorization for caching expensive operations - ([8d64d9f](https://github.com/ekino/node-logger/commit/8d64d9ff475d7e80a8115184b78373b37196111f))
- *(perf)* Implement fast-json-stringify for better performance json parser - ([10d473a](https://github.com/ekino/node-logger/commit/10d473a5e383dfcb5a5ce472209911325464e271))
- Update dependencies and typescript 6 - ([4d44eb2](https://github.com/ekino/node-logger/commit/4d44eb25f7bf3da637bfc619b4afcc6fce17071a))
- Use native node util.inspect for pretty json - ([939db27](https://github.com/ekino/node-logger/commit/939db2750141bbc6ce456bc738162bad7134aa88))
- Remove support for node18, support test for node24 - ([b025478](https://github.com/ekino/node-logger/commit/b025478214f8aec8ea45cd23757275d9507f8417))
- Use @tduyng/prettyouput to replace deprecated prettyoutput library - ([90d1bd9](https://github.com/ekino/node-logger/commit/90d1bd97f14f1d69bf6b24c8825be0f798515c6e))

### Bug Fixes

- *(lint)* Fix all linter issues - ([011198e](https://github.com/ekino/node-logger/commit/011198e0e80e6b80b570632f5aa974e49136271d))
- Resolve regressions and remove performance benchmarks - ([3112d11](https://github.com/ekino/node-logger/commit/3112d118760d33bd0053dbfe354f12ae8f29583f))
- Fast-json-stringify do not support replacer - ([ccbb2c6](https://github.com/ekino/node-logger/commit/ccbb2c630f7700d8415ef86cf6a253a197967621))
- Handle correctly dual signature for logMethod - ([4d6b3d1](https://github.com/ekino/node-logger/commit/4d6b3d117b6389caffdc7c0ad9afc81ecd2d84ee))

### Refactor

- *(adapters)* Create wrapper writable stream for process.stdout.write - ([8b83f9f](https://github.com/ekino/node-logger/commit/8b83f9ffa635f5c5a16beb806769a786f3842617))
- *(examples)* Give meaningfull messages - ([f1fd5e1](https://github.com/ekino/node-logger/commit/f1fd5e1cfc668d739db7a90a03e014ffbd4b4d2b))
- *(outils)* Remove unused function - ([bc3100c](https://github.com/ekino/node-logger/commit/bc3100c91db0c6d4b8f14036f3056d8fb20129bc))
- Separate json schema for fast-json-stringify - ([afd4099](https://github.com/ekino/node-logger/commit/afd40994965d6650becc6567f290bc04f0625c5d))
- Separate default config and mutual config - ([eac80d7](https://github.com/ekino/node-logger/commit/eac80d76f92f466a8326746a68f51cca0bb0251d))
- Implement pur functional, avoid mutable internal object - ([245729d](https://github.com/ekino/node-logger/commit/245729d731093ac251c340a2d5e4fa13bc441e81))
- Write native colors outils - ([94c17cb](https://github.com/ekino/node-logger/commit/94c17cbd7cf3b0f5ae04d7523d5e81993a0f97b7))

### Documentation

- *(3.0)* Add benchmarks results - ([2087ee3](https://github.com/ekino/node-logger/commit/2087ee370dcc6c9b979588fbc819ba4aaa1a98fd))
- *(3.0)* Create benchmark with v2, winston and pino - ([cbee334](https://github.com/ekino/node-logger/commit/cbee33437a453f55a9a63b42058d0536bba65bda))
- *(3.0)* Add breaking change docs - ([cfd1858](https://github.com/ekino/node-logger/commit/cfd18582118b2d226e40ebcc0bd4f9cf217335ea))
- *(3.0)* Update documentations - ([92fdfd5](https://github.com/ekino/node-logger/commit/92fdfd592bd6573cd9db47dab41cd15529a56bfc))
- *(3.0)* Update image examples - ([37a4acb](https://github.com/ekino/node-logger/commit/37a4acb3a098ae63c5e210383945ec6904f3d030))
- Correct informations - ([b369525](https://github.com/ekino/node-logger/commit/b36952562cdfd338c74f6ebbcc352c433997d12b))
- Update README.md - ([6780446](https://github.com/ekino/node-logger/commit/678044629fd9076f7fbe74368b1af18ab7a845b5))

### Performance

- *(3.0)* Avoid using Object.assign - ([783a6a8](https://github.com/ekino/node-logger/commit/783a6a804376ac97a2c5482a139e85eae15d4a25))
- *(3.0)* Early return log when not forcing and not active level - ([61decaf](https://github.com/ekino/node-logger/commit/61decaf2df27ce562e52920c2a7ee8f969148e44))

### Testing

- *(3.0)* Use correct type MockInstance for vi.spyOn - ([bbef8d2](https://github.com/ekino/node-logger/commit/bbef8d2c43050d7e1d3c621a02764f0bbb399bca))
- *(3.0)* Rewrite all test files in Typescript with vitest - ([06de2a3](https://github.com/ekino/node-logger/commit/06de2a3c611172163beabebf28a1db2849617336))
- *(3.0)* Reimplement coverage with vitest + c8 - ([291740b](https://github.com/ekino/node-logger/commit/291740beb016127d7761b6c66019514b09f000b7))
- *(3.0)* Rewrite tests with vitest for ESM - ([2ccdde4](https://github.com/ekino/node-logger/commit/2ccdde45280a79011b84cce9fefa911081452322))
- Improve coverages and show coverage summary - ([f62595a](https://github.com/ekino/node-logger/commit/f62595aa30f88ac088a537a411b42549a6d30a96))

### Miscellaneous Tasks

- *(3.0)* Simplify build scripts - ([06627ef](https://github.com/ekino/node-logger/commit/06627efc8f0f6d4f78c6df4da23206835adf26d8))
- *(3.0)* Upgrade dev dependencies - ([2f12694](https://github.com/ekino/node-logger/commit/2f126943d58727730cde582b03edf9845aed2a92))
- *(3.0)* Replace yarn by pnpm - ([7ecafb4](https://github.com/ekino/node-logger/commit/7ecafb42cba5c9fa74308ded6848dfeae352caa4))
- *(3.0)* Update the dev dependencies - ([434899d](https://github.com/ekino/node-logger/commit/434899d06f494cc7b70276a23e283638b18ee862))
- *(3.0)* Implement git cliff for highly customizable changelog - ([92c563e](https://github.com/ekino/node-logger/commit/92c563ed0ae8fd5def0ce7a9a1175580c9db647e))
- *(3.0)* Off useImportType lint rule - ([42164ed](https://github.com/ekino/node-logger/commit/42164ed7d44837a9cbcc7c4b21170c28dcb39b00))
- *(3.0)* Remove tsx, write build script directly in js - ([7632fbb](https://github.com/ekino/node-logger/commit/7632fbb201704a95cbfb54075e34d43d07eb7c2d))
- *(3.0)* Simplify and split and create helpers functions for benchmarking - ([7686758](https://github.com/ekino/node-logger/commit/76867589ba1bf507d1eb86a3c790eb8517b05426))
- *(3.0)* Add benchmark for complex objects - ([1c68174](https://github.com/ekino/node-logger/commit/1c68174bb833a3f5aada53a6c85fca9201ddb46b))
- *(3.0)* Add type checking step - ([708b16f](https://github.com/ekino/node-logger/commit/708b16f3b22cd5564974faf8e205799eaa94452c))
- *(3.0)* Add CONTRIBUTION rules - ([0af815e](https://github.com/ekino/node-logger/commit/0af815e4cfb352df23b2fc89ff4bdb3804138e54))
- *(3.0)* Cleanup package.json - ([252493e](https://github.com/ekino/node-logger/commit/252493efb857b40d501c2fabf352682eb8ee8bc5))
- *(3.0)* Add issue templates: bug, feature_request - ([9effe33](https://github.com/ekino/node-logger/commit/9effe3396bec941b4ee17a619abdf344098b42ae))
- *(3.0)* Add more tags - ([2a886fc](https://github.com/ekino/node-logger/commit/2a886fca0f79d96713ec147290669ec7e601242c))
- *(3.0)* Remove unused dependencies - ([8d79fb5](https://github.com/ekino/node-logger/commit/8d79fb56762e7b6b0b5046337de734bdc29d1630))
- *(3.0)* Run examples/*.ts with deno for faster execution - ([5ac9e32](https://github.com/ekino/node-logger/commit/5ac9e32e4c1b83615df5b19afb597dd2d008f993))
- *(3.0)* Simplify release step and build Typescript files - ([2afacab](https://github.com/ekino/node-logger/commit/2afacab580b48d2a89aeac5924c0cbcb6cd63788))
- *(3.0)* Fix, update action versions, run test on Nodejs18,20,22 - ([47c134a](https://github.com/ekino/node-logger/commit/47c134ab1f1819220fdd1ec80cb190bf23edf4b6))
- *(3.0)* Remove unused Makefile - ([53d8730](https://github.com/ekino/node-logger/commit/53d8730b74fc22313a7c84b3ab8f16d4d626dcef))
- *(3.0)* Set Node.js 18 as the minimum supported version - ([3a0f647](https://github.com/ekino/node-logger/commit/3a0f647ad31d5135c9aac2c8bd73a017b3a146df))
- *(3.0)* Support dual npm package in ESM and CJS - ([70735b5](https://github.com/ekino/node-logger/commit/70735b5ba478c402aab2344a81f64ebcb66d8f10))
- *(3.0)* Ignore format package.json by biome - ([109b4e1](https://github.com/ekino/node-logger/commit/109b4e1eae55ba851f4af0c934dca0601f360137))
- *(hooks)* Remove husky, use native githooks - ([0152daa](https://github.com/ekino/node-logger/commit/0152daae5450a1eda0c81ad5ccd49a3853878fe1))
- *(lint)* Implement biome and remove eslint,prettier - ([e7db6b8](https://github.com/ekino/node-logger/commit/e7db6b863f512686294c15cf3ac47045457c34a4))
- *(release)* V3.0.0 - ([1c50412](https://github.com/ekino/node-logger/commit/1c5041271ddda277b48ccafd2d14f4000bf7bbe4))
- *(yarn)* Use yarn v2 - ([4566757](https://github.com/ekino/node-logger/commit/45667578ba61f59a350b744117f954cdb76d55b4))
- Use pnpm 11 and add support node 26 - ([a93917f](https://github.com/ekino/node-logger/commit/a93917f187b1816a1f0bd17b89bc293997cabe57))
- Stop supporting node 20 (EOL) - ([055d986](https://github.com/ekino/node-logger/commit/055d9864b74af13f9198613a9e0ee34396c0539e))
- Implement OICD npm release workflow - ([d76b5d5](https://github.com/ekino/node-logger/commit/d76b5d5d80c43c657a6126740f4150e5da542817))
- Rename postinstall to hook script - ([43f90e4](https://github.com/ekino/node-logger/commit/43f90e408f4876c26290acef2bd7bc4dc1839639))
- Run only release by maintainer or admin - ([9dfb237](https://github.com/ekino/node-logger/commit/9dfb2373b2eda28e425c430132011f3dc887ce4e))
- Remove dead comments and update breaking changes for node version - ([dbdf95e](https://github.com/ekino/node-logger/commit/dbdf95edf44e039e4edf2a6f7a80823625c7c639))
- Update benchmarks - ([2bfe776](https://github.com/ekino/node-logger/commit/2bfe776e5cc9c738ab3e82070b7707612f82649e))
- Move prettyoutput to optional dependencies, not always needed - ([7b4626e](https://github.com/ekino/node-logger/commit/7b4626e4b47b477e81039da0870e75d4514820cf))
- Update dev dependencies - ([bef39aa](https://github.com/ekino/node-logger/commit/bef39aa97f69951a3dcea43302695ca038ee5f98))
- Check typings for all files - ([ef6856e](https://github.com/ekino/node-logger/commit/ef6856e2f90edf8207d66ab312c4926a75180797))
- Simplify bump version and tag with npm - ([8392aa3](https://github.com/ekino/node-logger/commit/8392aa31641003113363f982abd5470c3e2f0732))
- Setup bot user for creating release commit - ([d0f73e6](https://github.com/ekino/node-logger/commit/d0f73e641e1f83cd06df91bfdae8713cf4464ccf))

yarn run v1.22.19
$ /home/runner/work/node-logger/node-logger/node_modules/.bin/conventional-changelog -p conventionalcommits -r -u 0
### [2.1.1](https://github.com/ekino/node-logger/compare/v2.1.0...v2.1.1) (2023-01-05)


### Bug Fixes

* **force:** prevent syncLogger reset canForceWrite ([e8546f1](https://github.com/ekino/node-logger/commit/e8546f112cd8f089825f5a242b08c2aedb393553))

Done in 0.52s.



yarn run v1.22.19
$ /home/runner/work/node-logger/node-logger/node_modules/.bin/conventional-changelog -p conventionalcommits -r -u 0
## [2.1.0](https://github.com/ekino/node-logger/compare/v2.0.2...v2.1.0) (2023-01-04)


### Features

* **forceWrite:** add posibility to force the log ([017db9e](https://github.com/ekino/node-logger/commit/017db9ea5dc81a536840a300adeea3e2b3f4eb83))

Done in 0.41s.



yarn run v1.22.19
$ /home/runner/work/node-logger/node-logger/node_modules/.bin/conventional-changelog -p conventionalcommits -r -u 0
### [2.0.2](https://github.com/ekino/node-logger/compare/v2.0.1...v2.0.2) (2022-11-10)


### Bug Fixes

* **postinstall:** remove husky postinstall ([e4a53d2](https://github.com/ekino/node-logger/commit/e4a53d28b4378a3bbc92445e8acdbc09d7034234))

Done in 0.51s.



yarn run v1.22.19
$ /home/runner/work/node-logger/node-logger/node_modules/.bin/conventional-changelog -p conventionalcommits -r -u 0
### [2.0.1](https://github.com/ekino/node-logger/compare/v2.0.0...v2.0.1) (2022-11-10)

Done in 0.37s.



yarn run v1.22.19
$ /home/runner/work/node-logger/node-logger/node_modules/.bin/conventional-changelog -p conventionalcommits -r -u 0
## [2.0.0](https://github.com/ekino/node-logger/compare/v1.0.0...v2.0.0) (2022-11-10)


### Features

* **ci:** add release ([67b3b7b](https://github.com/ekino/node-logger/commit/67b3b7baa2b260695d35227d1374aecb145b4622))
* **typescript:** convert core files to ts ([840741e](https://github.com/ekino/node-logger/commit/840741e296714e4022de8e33a58e3495f6789d3f))

Done in 0.50s.



## [1.0.0](https://github.com/ekino/node-logger/compare/v0.3.0...v1.0.0) (2020-03-25)


### Features

* **doc:** add missing documentation about log level env ([f071ca4](https://github.com/ekino/node-logger/commit/f071ca4ec160350f25c5dff4dec044d92c77d47e))
* **logLevel:** override default log level with env variable ([5d207f4](https://github.com/ekino/node-logger/commit/5d207f4aa4ae2da220137a1753ea9967b2ce12d3))

## [0.3.0](https://github.com/ekino/node-logger/compare/v0.2.0...v0.3.0) (2019-12-18)


### Features

* **ci:** replace flowdock notification with slack ([d5e281c](https://github.com/ekino/node-logger/commit/d5e281c413b30fa26ac8767312be4893637a1d06))
* **modules:** replace default export with a named function ([c868c6d](https://github.com/ekino/node-logger/commit/c868c6d00d35155fb3c60b65cd8598392fc78b7a))
* **output:** Support multiple outputs ([3e598f6](https://github.com/ekino/node-logger/commit/3e598f62acbbd39f9a5e93f9e322ff981690a830))
* **publish:** prevent publication of examples ([1251c4d](https://github.com/ekino/node-logger/commit/1251c4d6247fc78fc3fd9228a1fbf6ca15038f20))
* **typescript:** add typescript definitions ([#8](https://github.com/ekino/node-logger/issues/8)) ([9be3a9b](https://github.com/ekino/node-logger/commit/9be3a9bf7906c33408875a7ade86442729284176))


### Bug Fixes

* **typescript:** fix typescript declarations ([3b470fa](https://github.com/ekino/node-logger/commit/3b470fab9de160c098665f3aceab220fff5a4711))

## [0.2.0](https://github.com/ekino/node-logger/compare/686724b43bc398c9ddf6fcd62ab515c377e4cb51...v0.2.0) (2017-07-05)


### Bug Fixes

* **global-context:** prevent mutation of global context ([686724b](https://github.com/ekino/node-logger/commit/686724b43bc398c9ddf6fcd62ab515c377e4cb51))
