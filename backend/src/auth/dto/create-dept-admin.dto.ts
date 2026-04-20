import { IsEmail, IsMongoId, IsString, MinLength } from 'class-validator';

export class CreateDeptAdminDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsMongoId()
  cityId: string;

  @IsMongoId()
  departmentId: string;
}
