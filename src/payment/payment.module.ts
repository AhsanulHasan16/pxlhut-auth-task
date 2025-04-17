import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './payment.schema';
import { UserModule } from 'src/user/user.module';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
        UserModule,
    ],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
