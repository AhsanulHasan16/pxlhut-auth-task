import { ConflictException, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from "src/user/dto/CreateUser.dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService { 
  constructor(      
    private userService: UserService,
    private jwtService: JwtService,
    @Inject('JWT_REFRESH_TOKEN')
    private jwtRefreshService: JwtService,
    private configService: ConfigService,
  ) { }
    
    async register(createUserDto: CreateUserDto) {
      const existing = await this.userService.findByEmail(createUserDto.email);
      if (existing) throw new ConflictException('Email already registered');
    
      const hashedPassword = bcrypt.hashSync(createUserDto.password, 10);
      return this.userService.createUser({
        ...createUserDto,
        password: hashedPassword,
      });
  }
  
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    
    const refresh_token = this.jwtRefreshService.sign(payload);
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.userService.updateRefreshToken(user._id, hashedRefreshToken);

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token,
    }
  }

  async refresh(refresh_token: string) {
    try {
      const payload = this.jwtService.verify(refresh_token,
        {
          secret: this.configService.get('JWT_REFRESH_SECRET'),
        }
      );

      const user = await this.userService.findById(payload.sub);

      if (!user) throw new UnauthorizedException('User not found');
      if (!user.refreshToken) throw new UnauthorizedException('Refresh token not found');

      const isMatch = await bcrypt.compare(refresh_token, user.refreshToken);
      if (!isMatch) throw new ForbiddenException('Invalid refresh token');

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Token expired or invalid');
    }
  }

}