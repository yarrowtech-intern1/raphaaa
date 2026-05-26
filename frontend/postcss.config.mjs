import postcssPresetEnv from 'postcss-preset-env';
import postcssOklabFunction from '@csstools/postcss-oklab-function';

export default {
  plugins: [
    postcssOklabFunction({ preserve: true }),
    postcssPresetEnv({
      stage: 3,
      features: {
        'oklab-function': { preserve: true },
      },
    }),
  ],
};
