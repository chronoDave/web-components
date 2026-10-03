import config from '@chronocide/eslint-config';

export default [...config({
  ts: true,
  node: true
}), {
  rules: {
    'import-x/no-extraneous-dependencies': 'off'
  }
}];
