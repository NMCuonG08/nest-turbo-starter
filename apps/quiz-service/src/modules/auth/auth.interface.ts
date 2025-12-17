import { JwtTokenType } from '@app/common';
import { Role } from '@app/common';

export interface TokenPayload {
  id: string;
  email: string;
  jti: string;
  role?: Role;
  type: JwtTokenType;
  iss: string;
}

export interface UserRequestPayload {
  id: string;
  jti: string;
  email: string;
  role?: Role;
  emailVerified?: boolean;
  iss?: string;
}
