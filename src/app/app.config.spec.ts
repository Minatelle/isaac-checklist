import { appConfig } from './app.config';

describe('appConfig', () => {
  it('registers application providers', () => {
    expect(appConfig.providers).toHaveLength(2);
  });
});
