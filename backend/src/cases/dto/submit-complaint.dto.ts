import { IsBoolean, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitComplaintDto {
  @IsMongoId()
  cityId: string;

  @IsMongoId()
  departmentId: string;

  @IsMongoId()
  complaintTypeId: string;

  @IsString()
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(100, { message: 'Description cannot exceed 100 characters' })
  description: string;

  @IsString()
  location: string;

  @IsBoolean()
  @IsOptional()
  isAnonymous?: boolean;
}
