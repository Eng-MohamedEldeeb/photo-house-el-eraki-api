import {
  Injectable,
  UnauthorizedException,
  OnModuleInit,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from '../../db/entities/admin.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Seed a default admin on first run if none exists
   * Credentials: admin / admin123  — CHANGE IN PRODUCTION
   */
  async onModuleInit() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await this.adminRepo.save(
        this.adminRepo.create({ username: 'admin', password: hashed }),
      );
      console.log('✅ Default admin seeded  →  admin / admin123');
    }
  }

  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; admin: Partial<Admin> }> {
    const admin = await this.adminRepo.findOne({
      where: { username: dto.username },
    });
    if (!admin) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, admin.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: admin.id, username: admin.username };
    const accessToken = this.jwtService.sign(payload);

    const { password: _, ...safe } = admin;
    return { accessToken, admin: safe };
  }
}
