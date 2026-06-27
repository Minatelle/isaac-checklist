import { ImagePathPipe } from './image-path.pipe';

describe('ImagePathPipe', () => {
  const pipe = new ImagePathPipe();

  it('builds image asset paths', () => {
    expect(pipe.transform('Platinum_God', 'marks')).toBe('/assets/icons/marks/Platinum_God.webp');
  });
});
