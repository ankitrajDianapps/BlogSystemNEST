import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import mongoose from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {

    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new BadRequestException("Invalid Object Id")
    }
    return value;
  }
}
