import { Body, Controller, Get, Post, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/user/dto/CreateUser.dto";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";

@Controller('auth')
export class AuthController { 
    constructor(private authService: AuthService) { }
    
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
}