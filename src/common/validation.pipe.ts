import { PipeTransform, Injectable, BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GenericValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      // If no metatype (e.g. String, Boolean, etc.), no need to validate
      return value;
    }

    const object = plainToClass(metatype, value);  // Transform plain object to class instance
    const errors = await validate(object);

    if (errors.length > 0) {
      // Extract detailed validation errors
      const detailedErrors = this.formatErrors(errors);
      throw new BadRequestException(detailedErrors);
    }

    return value;
  }

  // Helper method to extract and format the validation errors
  private formatErrors(errors: any[]) {
    return errors.map(err => {
      return {
        property: err.property,
        constraints: err.constraints  // Extract and include the constraints
      };
    });
  }

  // Helper method to check if the metatype is a class that should be validated
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);  // Only validate if it's not a primitive type
  }
}
