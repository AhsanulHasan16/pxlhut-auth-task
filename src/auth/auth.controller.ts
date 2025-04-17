import { Body, Controller, Get, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/user/dto/CreateUser.dto";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { UserService } from "src/user/user.service";

@Controller('auth')
export class AuthController { 
    constructor(private authService: AuthService,
        private userService: UserService,
    ) {}
    
    @Post('register')
    async register(@Body() registerDto: CreateUserDto) {
        return this.authService.register(registerDto);
    }

    @Throttle({ default: {ttl: 60_000, limit: 5 }})
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }

    @Post('refresh')
    async refreshTokens(@Body() body: { refreshToken: string }) {
        const user = await this.authService.refresh(body.refreshToken);
        return user;
    }

    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    async logout(@Request() req) {
    await this.userService.updateRefreshToken(req.user.userId, null);
        return { message: 'Logged out successfully' };
    }
}