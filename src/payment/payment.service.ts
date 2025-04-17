import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import Stripe from "stripe";
import { Payment, PaymentDocument } from "./payment.schema";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { PaymentDto } from "./payment.dto";


@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        private configService: ConfigService,
    ) {
        this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-03-31.basil',
        });
    }

    async checkout(paymentDto: PaymentDto, userId: string) {
        const amount = paymentDto.amount;
        const MIN_AMOUNT = 50; // USD minimum is 50 cents for stripe to process the payment

        if (amount < MIN_AMOUNT) {
            throw new BadRequestException('Amount must be at least $0.50 USD');
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: paymentDto.amount,
                currency: 'usd',
                payment_method_types: ['card'],
            });

            const payment = new this.paymentModel({
                userId,
                amount: paymentDto.amount,
                currency: 'usd',
                stripePaymentId: paymentIntent.id,
                status: paymentIntent.status,
            });

            return payment.save();
        } catch (error) {
            throw new InternalServerErrorException(`Payment failed: ${error.message}`);
        }
    }
 }