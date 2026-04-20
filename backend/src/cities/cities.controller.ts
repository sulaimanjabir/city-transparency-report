import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { City, CityDocument } from '../database/schemas/city.schema';

@Controller('cities')
export class CitiesController {
  constructor(@InjectModel(City.name) private cityModel: Model<CityDocument>) {}

  @Get()
  findAll() {
    return this.cityModel.find();
  }
}
