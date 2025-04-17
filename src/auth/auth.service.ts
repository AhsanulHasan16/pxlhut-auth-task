import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from "src/user/dto/CreateUser.dto";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService { 
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
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
    return {
      access_token: this.jwtService.sign(payload),
      user,
    }
  }

}