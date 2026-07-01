import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

import { normalizeDossierContentInput } from "../_shared/dossier.ts";
import {
  createOptionsResponse,
  getFunctionPath,
  handleError,
  HttpError,
  jsonResponse,
  readJsonBody,
  requireMethod,
} from "../_shared/http.ts";
import {
  assertMany,
  assertSingle,
  createId,
  nowIso,
  requireAdmin,
} from "../_shared/supabase.ts";

type AdminContext = Awaited<ReturnType<typeof requireAdmin>>;

function splitPath(path: string) {
  return path.split("/").filter(Boolean);
}

function createInsertPayload(body: Record<string, unknown>) {
  const payload = { ...body };

  delete payload.createdAt;
  delete payload.id;

  return {
    ...payload,
    id: createId(),
    updatedAt: nowIso(),
  };
}

function createUpdatePayload(body: Record<string, unknown>) {
  const payload = { ...body };

  delete payload.createdAt;
  delete payload.id;

  return {
    ...payload,
    updatedAt: nowIso(),
  };
}

function normalizeSiteCopyValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value == null) {
    return "";
  }

  return JSON.stringify(value);
}

async function getDashboardData(request: Request, context: AdminContext) {
  requireMethod(request, "GET");

  const supabase = context.supabase;
  const [
    profiles,
    contactLinks,
    technologies,
    projects,
    roadmap,
    siteCopy,
    dossierContent,
  ] = await Promise.all([
    assertMany<Record<string, unknown>>(
      supabase
        .from("Profile")
        .select("*")
        .order("updatedAt", { ascending: false })
        .limit(1),
    ),
    assertMany<Record<string, unknown>>(
      supabase
        .from("ContactLink")
        .select("*")
        .order("order", { ascending: true }),
    ),
    assertMany<Record<string, unknown>>(
      supabase
        .from("Technology")
        .select("*")
        .order("order", { ascending: true }),
    ),
    assertMany<Record<string, unknown>>(
      supabase
        .from("Project")
        .select("*")
        .order("order", { ascending: true }),
    ),
    assertMany<Record<string, unknown>>(
      supabase
        .from("RoadmapItem")
        .select("*")
        .order("order", { ascending: true }),
    ),
    assertMany<Record<string, unknown>>(
      supabase
        .from("SiteCopy")
        .select("*")
        .order("key", { ascending: true })
        .order("locale", { ascending: true }),
    ),
    assertMany<Record<string, unknown>>(
      supabase
        .from("DossierContent")
        .select("*")
        .order("locale", { ascending: true }),
    ),
  ]);

  return jsonResponse(request, {
    contactLinks,
    dossierContent,
    profile: profiles[0] ?? null,
    projects,
    roadmap,
    siteCopy,
    technologies,
  });
}

async function getDossierContent(request: Request, context: AdminContext) {
  requireMethod(request, "GET");

  const items = await assertMany<Record<string, unknown>>(
    context.supabase
      .from("DossierContent")
      .select("*")
      .order("locale", { ascending: true }),
  );

  return jsonResponse(request, { items });
}

async function upsertDossierContent(
  request: Request,
  context: AdminContext,
  locale: string,
) {
  requireMethod(request, "PUT");

  const body = await readJsonBody(request);
  const data = normalizeDossierContentInput(locale, body);
  const existing = await assertSingle<{ id: string }>(
    context.supabase
      .from("DossierContent")
      .select("id")
      .eq("locale", data.locale)
      .maybeSingle(),
  );

  const saveOperation = existing?.id
    ? context.supabase
      .from("DossierContent")
      .update({ ...data, updatedAt: nowIso() })
      .eq("id", existing.id)
      .select("*")
      .single()
    : context.supabase
      .from("DossierContent")
      .insert({ ...data, id: createId(), updatedAt: nowIso() })
      .select("*")
      .single();
  const saved = await assertSingle<Record<string, unknown>>(saveOperation);

  return jsonResponse(request, saved);
}

async function updateProfile(request: Request, context: AdminContext) {
  requireMethod(request, "PUT");

  const body = await readJsonBody(request);
  const profiles = await assertMany<Record<string, unknown>>(
    context.supabase
      .from("Profile")
      .select("id")
      .order("updatedAt", { ascending: false })
      .limit(1),
  );
  const profile = profiles[0];

  if (!profile?.id) {
    const created = await assertSingle<Record<string, unknown>>(
      context.supabase
        .from("Profile")
        .insert(createInsertPayload(body))
        .select("*")
        .single(),
    );

    return jsonResponse(request, created);
  }

  const updated = await assertSingle<Record<string, unknown>>(
    context.supabase
      .from("Profile")
      .update(createUpdatePayload(body))
      .eq("id", profile.id)
      .select("*")
      .single(),
  );

  return jsonResponse(request, updated);
}

async function createRecord(
  request: Request,
  context: AdminContext,
  tableName: string,
) {
  requireMethod(request, "POST");

  const body = await readJsonBody(request);
  const created = await assertSingle<Record<string, unknown>>(
    context.supabase
      .from(tableName)
      .insert(createInsertPayload(body))
      .select("*")
      .single(),
  );

  return jsonResponse(request, created);
}

async function updateRecord(
  request: Request,
  context: AdminContext,
  tableName: string,
  id: string,
) {
  requireMethod(request, "PUT");

  if (!id) {
    throw new HttpError(404, "Registro nao encontrado");
  }

  const body = await readJsonBody(request);
  const updated = await assertSingle<Record<string, unknown>>(
    context.supabase
      .from(tableName)
      .update(createUpdatePayload(body))
      .eq("id", id)
      .select("*")
      .single(),
  );

  return jsonResponse(request, updated);
}

async function deleteRecord(
  request: Request,
  context: AdminContext,
  tableName: string,
  id: string,
) {
  requireMethod(request, "DELETE");

  if (!id) {
    throw new HttpError(404, "Registro nao encontrado");
  }

  const { error } = await context.supabase.from(tableName).delete().eq("id", id);

  if (error) {
    throw new HttpError(500, error.message);
  }

  return jsonResponse(request, { deleted: true });
}

async function upsertSiteCopy(request: Request, context: AdminContext) {
  requireMethod(request, "POST");

  const body = await readJsonBody(request);
  const key = typeof body.key === "string" ? body.key : "";
  const locale = typeof body.locale === "string" ? body.locale : "";

  if (!key || !locale) {
    throw new HttpError(404, "Chave e locale sao obrigatorios");
  }

  const existing = await assertSingle<{ id: string }>(
    context.supabase
      .from("SiteCopy")
      .select("id")
      .eq("key", key)
      .eq("locale", locale)
      .maybeSingle(),
  );

  const saveOperation = existing?.id
    ? context.supabase
      .from("SiteCopy")
      .update({
        updatedAt: nowIso(),
        value: normalizeSiteCopyValue(body.value),
      })
      .eq("id", existing.id)
      .select("*")
      .single()
    : context.supabase
      .from("SiteCopy")
      .insert({
        id: createId(),
        key,
        locale,
        updatedAt: nowIso(),
        value: normalizeSiteCopyValue(body.value),
      })
      .select("*")
      .single();
  const saved = await assertSingle<Record<string, unknown>>(saveOperation);

  return jsonResponse(request, saved);
}

function getCrudTable(resource: string) {
  const tableByResource: Record<string, string> = {
    "contact-links": "ContactLink",
    projects: "Project",
    roadmap: "RoadmapItem",
    technologies: "Technology",
  };

  return tableByResource[resource];
}

async function handleAdminRoute(request: Request, context: AdminContext) {
  const path = getFunctionPath(request, "admin");
  const [resource, id] = splitPath(path);

  if (resource === "content" && !id) {
    return await getDashboardData(request, context);
  }

  if (resource === "dossier" && !id) {
    return await getDossierContent(request, context);
  }

  if (resource === "dossier" && id) {
    return await upsertDossierContent(request, context, id);
  }

  if (resource === "profile" && !id) {
    return await updateProfile(request, context);
  }

  if (resource === "site-copy" && !id) {
    return await upsertSiteCopy(request, context);
  }

  if (resource === "site-copy" && id) {
    if (request.method === "PUT") {
      return await updateRecord(request, context, "SiteCopy", id);
    }

    if (request.method === "DELETE") {
      return await deleteRecord(request, context, "SiteCopy", id);
    }
  }

  const tableName = getCrudTable(resource ?? "");

  if (tableName && !id) {
    return await createRecord(request, context, tableName);
  }

  if (tableName && id) {
    if (request.method === "PUT") {
      return await updateRecord(request, context, tableName, id);
    }

    if (request.method === "DELETE") {
      return await deleteRecord(request, context, tableName, id);
    }
  }

  throw new HttpError(404, "Rota administrativa nao encontrada");
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return createOptionsResponse(request);
  }

  try {
    const context = await requireAdmin(request);

    return await handleAdminRoute(request, context);
  } catch (error) {
    return handleError(request, error);
  }
});
