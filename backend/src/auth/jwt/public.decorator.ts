import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
//export const Public = (): any => { SetMetadata(IS_PUBLIC_KEY, true) }
export function Public() {
  return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
    SetMetadata(IS_PUBLIC_KEY, true)(target, key, descriptor)
  }
}
