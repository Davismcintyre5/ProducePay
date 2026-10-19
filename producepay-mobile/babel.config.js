module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
          extensions: [
            '.ios.ts',
            '.ios.tsx',
            '.android.ts',
            '.android.tsx',
            '.native.ts',
            '.native.tsx',
            '.ts',
            '.tsx',
            '.js',
            '.jsx',
            '.json',
          ],
        },
      ],
    ],
  };
};