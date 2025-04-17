import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/CreateUser.dto";
import { AuthGuard } from "@nestjs/passport";
import { RolesGuard } from "src/roles.guard";
import { Roles } from "src/roles.decorator";


@Controller('user')
export class UserController { 
    constructor(private userService: UserService) { }
    
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('admin')
    @Post('create')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
}