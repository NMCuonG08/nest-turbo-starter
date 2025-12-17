import {
  ERROR_RESPONSE,
  ServerException,
  UserMessagePattern,
  UserRequestPayload,
} from '@app/common';
import { TokenPayload } from '@app/common';
import { MicroserviceName, MS_INJECTION_TOKEN } from '@app/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, Transport } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Strategy } from 'passport-custom';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class GatewayAuthStrategy extends PassportStrategy(Strategy, 'gateway-auth') {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject(MS_INJECTION_TOKEN(MicroserviceName.UserService, Transport.TCP))
    private readonly userClientTCP: ClientProxy,
  ) {
    super();
  }

  async validate(req: Request): Promise<UserRequestPayload> {
    const { headers } = req;
    const authUserHeader = headers['x-auth-user'];
    if (!authUserHeader) throw new ServerException(ERROR_RESPONSE.UNAUTHORIZED);

    const authUser: TokenPayload = JSON.parse(authUserHeader);
    if (!authUser?.id) throw new ServerException(ERROR_RESPONSE.UNAUTHORIZED);

    const user = await lastValueFrom(
      this.userClientTCP.send(UserMessagePattern.GET_USER, { id: authUser.id }),
    );
    if (!user) throw new ServerException(ERROR_RESPONSE.UNAUTHORIZED);
    if (!user.isActive) throw new ServerException(ERROR_RESPONSE.USER_DEACTIVATED);

    return {
      id: user.id,
      jti: authUser.jti,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    };
  }
}
