import {
  ERROR_RESPONSE,
  jwtConfiguration,
  JwtTokenType,
  ServerException,
  UserMessagePattern,
} from '@app/common';
import { MicroserviceName, MS_INJECTION_TOKEN, RedisService } from '@app/core';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ClientProxy, Transport } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { lastValueFrom } from 'rxjs';
import { UserRequestPayload } from 'src/modules/auth/auth.interface';

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, 'jwt-auth') {
  constructor(
    private redisService: RedisService,
    @Inject(jwtConfiguration.KEY)
    private jwtConfig: ConfigType<typeof jwtConfiguration>,
    @Inject(MS_INJECTION_TOKEN(MicroserviceName.UserService, Transport.TCP))
    private readonly userClientTCP: ClientProxy,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any): Promise<UserRequestPayload> {
    const { id, email, jti, type, role } = payload;
    if (type !== JwtTokenType.AccessToken)
      throw new ServerException(ERROR_RESPONSE.UNAUTHORIZED);

    // Check valid token
    const userTokenKey = this.redisService.getUserTokenKey(id, jti);
    const isTokenValid = await this.redisService.getValue<string>(userTokenKey);
    if (!isTokenValid) throw new ServerException(ERROR_RESPONSE.UNAUTHORIZED);
    const user = await lastValueFrom(
      this.userClientTCP.send(UserMessagePattern.GET_USER, { id }),
    );
    if (!user) throw new ServerException(ERROR_RESPONSE.UNAUTHORIZED);
    if (!user.isActive) throw new ServerException(ERROR_RESPONSE.USER_DEACTIVATED);

    return {
      id,
      email,
      jti,
      role,
      emailVerified: true,
    };
  }
}
