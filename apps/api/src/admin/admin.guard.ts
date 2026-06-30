import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JWTPayload, jwtVerify } from 'jose';

type RequestWithSupabase = Request & {
  supabaseUser?: JWTPayload;
};

type JoseModule = {
  createRemoteJWKSet: typeof import('jose').createRemoteJWKSet;
  jwtVerify: typeof jwtVerify;
};

let jwks: ReturnType<JoseModule['createRemoteJWKSet']> | null = null;

function getBearerToken(request: Request) {
  const authorization = request.headers.authorization;

  return authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';
}

function getAllowedAdminEmails() {
  return (process.env.SUPABASE_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getSupabaseUrl() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');

  if (!supabaseUrl) {
    throw new UnauthorizedException('SUPABASE_URL nao configurado');
  }

  return supabaseUrl;
}

function getJwksUrl() {
  return (
    process.env.SUPABASE_JWKS_URL ||
    `${getSupabaseUrl()}/auth/v1/.well-known/jwks.json`
  );
}

async function verifySupabaseJwt(token: string) {
  const jose = (await import('jose')) as JoseModule;

  jwks ??= jose.createRemoteJWKSet(new URL(getJwksUrl()));

  const { payload } = await jose.jwtVerify(token, jwks, {
    audience: 'authenticated',
    issuer: `${getSupabaseUrl()}/auth/v1`,
  });

  return payload;
}

@Injectable()
export class AdminGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithSupabase>();
    const token = getBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Token admin ausente');
    }

    const allowedEmails = getAllowedAdminEmails();

    if (allowedEmails.length === 0) {
      throw new UnauthorizedException('Allowlist admin nao configurada');
    }

    let userClaims: JWTPayload;

    try {
      userClaims = await verifySupabaseJwt(token);
    } catch {
      throw new UnauthorizedException('Token Supabase invalido');
    }

    const adminEmail =
      typeof userClaims.email === 'string'
        ? userClaims.email.toLowerCase()
        : '';

    if (!adminEmail) {
      throw new UnauthorizedException('Token Supabase sem email');
    }

    if (!allowedEmails.includes(adminEmail)) {
      throw new UnauthorizedException('Email admin nao autorizado');
    }

    request.supabaseUser = userClaims;
    return true;
  }
}
