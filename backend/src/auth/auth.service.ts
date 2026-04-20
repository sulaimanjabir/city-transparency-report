import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CreateDeptAdminDto } from './dto/create-dept-admin.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.createCitizen(dto);
    return this.signToken(user);
  }

  async createDeptAdmin(dto: CreateDeptAdminDto) {
    const user = await this.usersService.createDeptAdmin(dto);
    return { message: 'Department admin created', userId: user._id };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user);
  }

  private signToken(user: any) {
    const id = user._id.toString();
    const payload = {
      sub: id,
      email: user.email,
      role: user.role,
      cityId: user.cityId?.toString(),
      departmentId: user.departmentId?.toString(),
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id,
        name: user.name,
        email: user.email,
        role: user.role,
        cityId: user.cityId?.toString(),
        departmentId: user.departmentId?.toString(),
      },
    };
  }
}
