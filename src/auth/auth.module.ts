import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { UserModule } from "src/user/user.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (ConfigService: ConfigService) => ({
                secret: ConfigService.get('JWT_SECRET'),
                signOptions: { expiresIn: ConfigService.get('JWT_EXPIRES_IN')},
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [AuthService, JwtStrategy, LocalStrategy,
        {
            provide: 'JWT_REFRESH_TOKEN',
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return new JwtService({
                    secret: configService.get('JWT_REFRESH_SECRET'),
                    signOptions: {
                        expiresIn: configService.get('JWT_REFRESH_EXPIRES_IN'),
                    },
                });
            },
        },
    ],
    controllers: [AuthController],
})
export class AuthModule { }