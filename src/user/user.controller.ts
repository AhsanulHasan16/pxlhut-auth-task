import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/CreateUser.dto";


@Controller('user')
export class UserController { 
    constructor(private userService: UserService) { }
    
    @Post('create')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.userService.createUser(createUserDto);
    }
}