import { codeExpiresConfiguration, jwtConfiguration } from '@app/common';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthStrategy } from 'src/modules/auth/strategies';
import { GatewayAuthStrategy } from './strategies/gateway-auth.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfiguration, codeExpiresConfiguration],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfiguration)],
      useFactory: async (jwtConfig: ConfigType<typeof jwtConfiguration>) => ({
        global: true,
        secret: jwtConfig.secret,
        signOptions: {
          algorithm: jwtConfig.algorithm,
        },
      }),
      inject: [jwtConfiguration.KEY],
    }),
  ],
  providers: [JwtAuthStrategy, GatewayAuthStrategy],
})
export class AuthModule {}
