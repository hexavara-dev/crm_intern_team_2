module.exports = {
  apps: [
    {
      name: 'hexavara-crm',
      script: './node_modules/.bin/tsx',
      args: 'src/index.ts',
      interpreter: 'none',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
