import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiResponseOptions } from '@nestjs/swagger'
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Public } from 'src/auth/jwt/public.decorator'

export function Route(params:{
  public?:boolean,
  method:Function,
  description:Partial<OperationObject>,
  responses?:ApiResponseOptions[]
}): MethodDecorator {
  return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
    if (params.public) {
      Public()(target, key, descriptor)
    } else {
      UseGuards(AuthGuard('jwt'))(target, key, descriptor)
      ApiBearerAuth()(target, key, descriptor)
    }
    params.method(target, key, descriptor)
    ApiOperation(params.description)(target, key, descriptor)    
    params.responses?.forEach((resp) => {
      ApiResponse(resp)(target, key, descriptor)
    })
    
    UsePipes(ValidationPipe)(target, key, descriptor)
  }
}