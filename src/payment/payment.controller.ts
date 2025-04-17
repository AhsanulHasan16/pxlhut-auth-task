import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { PaymentDto } from "./payment.dto";
import { AuthGuard } from "@nestjs/passport";


@Controller('payment')
export class PaymentController { 
    constructor(private paymentService: PaymentService) { }
    
    @UseGuards(AuthGuard('jwt'))
    @Post('checkout')
    async checkout(@Body() paymentDto: PaymentDto, @Request() req) {
        return this.paymentService.checkout(paymentDto, req.user.userId);
    }
}