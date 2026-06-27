import { Pipe, PipeTransform } from '@angular/core';

import { buildImagePath } from '../utils/checklist.utils';

@Pipe({
  name: 'imagePath'
})
export class ImagePathPipe implements PipeTransform {
  transform(icon: string, folder: string): string {
    return buildImagePath(folder, icon);
  }
}
