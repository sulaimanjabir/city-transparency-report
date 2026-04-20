import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { CasesModule } from './cases/cases.module';
import { VotesModule } from './votes/votes.module';
import { CitiesModule } from './cities/cities.module';
import { DepartmentsModule } from './departments/departments.module';
import { ComplaintTypesModule } from './complaint-types/complaint-types.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    CasesModule,
    VotesModule,
    CitiesModule,
    DepartmentsModule,
    ComplaintTypesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
