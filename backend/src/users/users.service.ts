import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../database/schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';
import { CreateDeptAdminDto } from '../auth/dto/create-dept-admin.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createCitizen(dto: RegisterDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.CITIZEN,
      cityId: new Types.ObjectId(dto.cityId),
    });
  }

  async createDeptAdmin(dto: CreateDeptAdminDto): Promise<UserDocument> {
    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 10);
    return this.userModel.create({
      name: dto.name,
      email: dto.email,
      password: hashed,
      role: UserRole.DEPT_ADMIN,
      cityId: new Types.ObjectId(dto.cityId),
      departmentId: new Types.ObjectId(dto.departmentId),
    });
  }

  async findDeptAdmins(): Promise<UserDocument[]> {
    return this.userModel
      .find({ role: UserRole.DEPT_ADMIN })
      .select('-password')
      .populate('departmentId', 'name')
      .populate('cityId', 'name');
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
